
import express from 'express';
import morgan from 'morgan';
import colors from 'colors'; // https://www.npmjs.com/package/colors
import bodyParser from 'body-parser';
import HttpStatus from 'http-status-codes'
import config from './config';
import Handler from './sources.handler';
import getApi from './api';
import {methods, REG_ALL} from './constants';
const {isLogEnabled} = config;
import MatchingResult, {
  MATCH_TYPE,
  MATCH_NO,
  MATCH_STRICT,
  MATCH_DEFAULT
} from './src/MatchingResult';
import MatchItem from './src/MatchItem';


class Server{

  /**
   *
   */
  constructor(sources, serverConfig){
    this.app = express();
    this.serverConfig = serverConfig;

    this.startLogger(isLogEnabled, this.app, morgan);

    this.handler = new Handler(sources);

    console.log('******* CONFIG **********'.yellow);

    this.app.use(bodyParser.json());

    const DEFAULT_CONTRLOL_API_URL = '/api/v1';
    let controlApiUrl = DEFAULT_CONTRLOL_API_URL;
    if(serverConfig.controlApiUrl){
      controlApiUrl = serverConfig.controlApiUrl;
    }
    this.app.use( controlApiUrl, getApi(this.handler) );
  }

  /**
   *                  exist     dont      exist     dont
   *  req/master        0         1         0         1
   *  bundle/slave      0         0         1         1
   *  result =          strict    default   no        subset/no
   *
   *  @param {Object} masterQS          request
   *  @param {Array.<Object>} slaveQS   bundle
   */
  getMatchingResultByQueryStrings(masterQS, slaveQS){
    const TYPE_SPECIFIC_REGEX = 'SPECIFIC_REGEX';
    let isMasterExist = !!masterQS && JSON.stringify(masterQS) !== '{}';
    let isSlaveExist = !!slaveQS;
    // console.log('+++++++++++'.green);
    // console.log(masterQS);
    // console.log(slaveQS);
    // console.log('+++++++++++'.blue);
    if(!isMasterExist && !isSlaveExist) return MATCH_STRICT;
    if(!isMasterExist && isSlaveExist) return MATCH_NO;
    if(isMasterExist && !isSlaveExist) return MATCH_DEFAULT;
    let result = null;
    let countOfMatches = 0;
    let countOfMatchesUnspecific = 0;
    slaveQS.forEach(({name, values, type}) => {
      if(!masterQS[name]){
        result = MATCH_NO;
      }else{
        let isContained = (values.indexOf(masterQS[name]) !== -1);

        let isSpecific = (values.indexOf(REG_ALL) === -1);
        if(type === TYPE_SPECIFIC_REGEX){
          isSpecific = true;
          if(!isContained){
            values.forEach(value => {
              let regex = new RegExp(value);

              // console.log(name);
              // console.log(regex);
              // console.log(masterQS[name]);
              // console.log('regex.test(masterQS[name]) ' +regex.test(masterQS[name]));
              if(regex.test(masterQS[name])){
                isSpecific = false;
              }
            })
          }
        }

        if(isSpecific && !isContained){
          result = MATCH_NO;
        }else{
          if(!isSpecific) countOfMatchesUnspecific++;
          countOfMatches++;
        }
      }
    });

    if(result !== null) return result;

    let masterQSLength = Object.keys(masterQS).length;
    let slaveQSLength = slaveQS.length;

    if(slaveQSLength === countOfMatches && countOfMatches === masterQSLength) return MATCH_STRICT;
    return new MatchingResult(MATCH_TYPE.SUBSET, countOfMatches, countOfMatchesUnspecific);
  }

  /**
   *
   */
  matchRecordGet(req, bundle){
    let matches = this.getMatchesByQueryString(req, bundle);
    matches.sort((a, b) => {
      return b.result.compare(a.result);
    });
    // console.log('+++++++++++++++++');
    // myLog(matches);
    if(matches.length === 0) return null;
    return matches[0].record;
  }

  /**
   *
   */
  getMatchesByQueryString(req, bundle){
    let matches = [];
    bundle.forEach(record =>{
      let result = this.getMatchingResultByQueryStrings(req.query, record.queryStringParameters);
      // console.log('result');
      // console.log(result);
      if(!result.isNo()){
        matches.push(new MatchItem(record, result));
      }
    });
    return matches;
  }

  /**
   *  TODO refaktor jako v getu do MatchItem
   */
  matchRecordPost(req, bundle){
    let matches = this.getMatchesByQueryString(req, bundle);
    matches.sort((a, b) => {
      return b.result.compare(a.result);
    });

    let requestBody = req.body;

    // console.log('***********');
    // console.log(requestBody);
    // console.log('=========== matches count: '+matches.length);
    // myLog(matches);
    // console.log('..................');

    let searchedRecord = null;
    let searchedRecordDefault = null;
    let searchedRecordRegex = null;
    matches.forEach(({record}) => {
      let {body} = record;
      if(!!body){
        if(!!body.type && !!body.value){

          switch(body.type){
            case "REGEX":{
              let value = body.value;


              var re = new RegExp(value, 'g');
              var str = JSON.stringify(requestBody);
              var result = str.match(re);
              // console.log('+++++++++++++');
              // console.log(str);
              // console.log(value);
              // console.log(result);

              let isMatched = !!result;
              if(isMatched && !searchedRecordRegex){
                searchedRecordRegex = record;
              }
              // console.log('REGEX '+!!result);
              break;
            }
            case "JSON":{
              // match only filled
              if(body.matchType && body.matchType === 'ONLY_MATCHING_FIELDS'){
                let recordBodyValue = JSON.parse(body.value);

                // let requestBodyKeysLength = Object.keys(requestBody).length;
                // let recordBodyKeysLength = Object.keys(recordBodyValue).length;
                // if(requestBodyKeysLength === recordBodyKeysLength){
                  let isMatched = true;
                  Object.keys(recordBodyValue).forEach((key) => {
                    let value = recordBodyValue[key];
                    if(JSON.stringify(value) !== JSON.stringify(requestBody[key])){
                      isMatched = false;
                    }
                  });
                  if(isMatched && !searchedRecord){
                    searchedRecord = record;
                  }
                  // console.log('TEST FOR MATCH = '+isMatched);
                // }else{
                  // console.log('NO MATCH');
                // }
                break; // break only if type is ONLY_MATCHING_FIELDS
              }
            }
            case "STRING":
            default:{
              // exact match
              // console.log('******');
              // console.log(body.value);
              // console.log('------------');
              // console.log(JSON.stringify(requestBody));
              // console.log('=============');
              // console.log(body.value === JSON.stringify(requestBody));

              let isMatched = (body.value === JSON.stringify(requestBody));
              if(isMatched && !searchedRecord){
                searchedRecord = record;
              }
              // console.log('EXACT DEFAULT '+isMatched);
            }
          }
        }else{
          let isMatched = (body === JSON.stringify(requestBody));
          if(isMatched && !searchedRecord){
            searchedRecord = record;
          }
          // console.log('EXACT');
          // exact match
        }
      } else{

        let isRequestBodyEmpty = (!requestBody || JSON.stringify(requestBody) === '{}');
        // console.log('ELSE');
        // console.log('isRequestBodyEmpty '+isRequestBodyEmpty);
        // console.log(requestBody);
        if(isRequestBodyEmpty && !searchedRecord){
          searchedRecord = record;
        }else if(!searchedRecordDefault){
          searchedRecordDefault = record;
        }
      }

      // myLog(record);
    })

    if(!searchedRecord){
      searchedRecord = searchedRecordRegex;
    }
    if(!searchedRecord){
      searchedRecord = searchedRecordDefault;
    }

    // console.log('POST RESULT'.yellow);
    // console.log(JSON.stringify(searchedRecord, null, "  "));
    return searchedRecord;
  }

  /**
   *
   */
  cb(req, res){
    let map = this.handler.getMap();
    let method = req.method;
    let path = req.route.path;
    let bundle = map[path][method];

    // console.log(method);
    // console.log(req.body);

    let response = null;
    let matchedRecord = null;

    if(bundle.length === 1){
      response = bundle[0].response;
    }else{

      switch(method) {

        case methods.POST:{
          matchedRecord = this.matchRecordPost(req, bundle);
          break;
        }

        case methods.GET:
        case methods.PUT:
        case methods.DELETE:
        default:{
          matchedRecord = this.matchRecordGet(req, bundle);
        }
      }

      if(matchedRecord !== null) {
        response = matchedRecord.response;
      }

      if(response === null){
        console.log(colors.bgRed.white('ERR no reaponse but why?'));
        console.log('method '+ method + '    path '+path);
        console.log('QUERY'.yellow);
        console.log(req.query);
        console.log('BODY'.yellow);
        console.log(req.body);
        res.status(HttpStatus.NOT_FOUND).send('NOT FOUND - no reaponse but why? Look to console.').end();
        return;
      }
    }

    if(!!response.headers){
      response.headers.forEach((headerItem) => {
        res.setHeader(headerItem['name'], headerItem['values'][0]);
      });
    }

    const APPLICATION_JSON = 'application/json';
    res
      .status(response.statusCode)
      .type(APPLICATION_JSON)
      .send(response.body)
      .end();
  };

  /**
   *
   */
  init(){

    // registrace paths
    let map = this.handler.getMap();

    Object.keys(map).forEach((path) => {
      let pathItem = map[path];
      let gets = pathItem[methods.GET];
      if(gets){
        gets.forEach(record => {
          this.app.get(path, this.cb.bind(this));
          this.logRegistredPath(isLogEnabled, methods.GET, path);
        });
      }

      let posts = pathItem[methods.POST];
      if(posts){
        posts.forEach(record => {
          this.app.post(path, this.cb.bind(this));
          this.logRegistredPath(isLogEnabled, methods.POST, path);
        });
      }

      let puts = pathItem[methods.PUT];
      if(puts){
        puts.forEach(record => {
          this.app.put(path, this.cb.bind(this));
          this.logRegistredPath(isLogEnabled, methods.PUT, path);
        });
      }

      let deletes = pathItem[methods.DELETE];
      if(deletes){
        deletes.forEach(record => {
          this.app.delete(path, this.cb.bind(this));
          this.logRegistredPath(isLogEnabled, methods.DELETE, path);
        });
      }
    });
  }

  /**
   *
   */
  start(){
    this.init();
    const {port} = config;
    let serverPort = port;
    if(this.serverConfig.port){
      serverPort = this.serverConfig.port;
    }

    this.serverStart(this.app, serverPort);
  }


  /**
   *  Method to log registred path
   */
  logRegistredPath(isLogEnabled, method, path){
    if(isLogEnabled){
      console.log(`REG ${method} ${path}`.magenta);
    }
  }

  /**
   *  Method to start logger of requests
   *    Actual format
   *      0.230 ms GET 200 /some/url/
   *    More option
   *      https://github.com/expressjs/morgan
   */
  startLogger(isLogEnabled, app, morgan){
    if(isLogEnabled){
      this.app.use(morgan(':response-time ms :method :status :url'));
    }
  }

  /**
   *  Method to start server
   */
  serverStart(app, port){
    this.app.listen(port, () => {
      console.log(`* Server port    ${port}`.yellow);
      console.log(`*************************`.yellow);
      console.log(colors.bgGreen.white('Server START'));
    });
  }

}


/**
 *
 */
function myLog(obj){
  console.log(JSON.stringify(obj, null, "  "));
}

/**
 *
 *  @param {Object} serverConfig
              controlApiUrl    ['/api/v1']
              port             [8080]
 */
export function createServer(sources, serverConfig = {}){
  return new Server(sources, serverConfig);
}


/**
 *  Method to run whole server
 */
export function runServer(sources, serverConfig = {}){
  const server = new Server(sources, serverConfig);
  server.start();
  return server;
}


