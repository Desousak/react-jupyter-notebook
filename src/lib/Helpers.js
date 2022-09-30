function setCharAt(str, index, chr) {
  if (index > str.length - 1) return chr;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

export { setCharAt };
