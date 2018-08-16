class Digger {
  constructor(res, onResponse) {
    this.data = '';
    this.onResponse = onResponse;
    res.on('data', chunk => {
      this.data += chunk;
    });
    res.on('end', this.makeOnResponse.bind(this));
  }

  makeOnResponse() {
    this.onResponse(this.getData());
  }

  getData() {
    return JSON.parse(this.data);
  }
}

export default Digger;
