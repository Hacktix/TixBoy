Math.sinc = function (x) {
    if (x === 0) {
      return 1
    }
    return (Math.sin(Math.PI * x)) / (Math.PI * x)
}