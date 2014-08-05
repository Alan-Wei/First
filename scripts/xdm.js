var XDM = function (targetDoc) {
    this.targetDoc = targetDoc;

    var domain = 'http://' + location.host;
    this.post = function (msg, targetDoc) {
        if (targetDoc) {
            targetDoc.postMessage(msg, domain);
        } else {
            this.targetDoc.postMessage(msg, domain);
        }
    };
    this.resetDoc = function (doc) {
        console.log(doc);
        this.targetDoc = doc;
    }
};