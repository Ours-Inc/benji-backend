const {
  BENJI_SECRET_PASSWORD_TOKEN,
} = process.env;


/**
 * Using the BENJI_SECRET_PASSWORD_TOKEN variable and authcode var, create a pw
 * @param {Number} authCode
 */
const passwordGenerator = authCode => {
  return `${ BENJI_SECRET_PASSWORD_TOKEN }${ authCode }`;
};


export default passwordGenerator;
