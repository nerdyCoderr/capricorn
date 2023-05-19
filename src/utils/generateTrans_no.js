function generateTrans_no() {
  try {
    const length = 15;
    const characters = "0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = generateTrans_no;
