module.exports = function(){
  return {
    succeed: (result) => {
      console.log(JSON.stringify(result, null, '\t'));
    },
    fail: (err) => {
      console.log(JSON.stringify(err, null, '\t'));
    },
    done: (err, result) => {
      console.log("Context done: ", err, result);
    },
    
    functionName: 'localFn'
  };
};