function Enter() {
  if(! (this instanceof arguments.callee)) {
    return new arguments.callee(arguments);
  }
}
