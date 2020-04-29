// Vendor modules
import ExtendableError from 'extendable-error-class';

// Providers
import Parse from '../providers/ParseProvider';

// Services
import TwoFAService from '../services/TwoFAService';
import UserService from '../services/UserService';

// Utils
import generatePassword from '../utils/generatePassword';

class SendCodeError extends ExtendableError {}

/**
 * Initiate 2-Factor Authentication for given phone number
 * @param {*} request
 */
const sendCode = async request => {
  const { params, installationId } = request;
  let { phoneNumber } = params;

  // Phone number is required in request body
  if (!phoneNumber) {
    throw new SendCodeError('[Zc1UZev9] No phone number provided in request');
  }
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo('phoneNumber', phoneNumber);
  let user = await userQuery.first({ useMasterKey: true });
  if (user && user.get('verificationStatus') === 'approved') {
    throw new SendCodeError('[Zc1UZev9] Your account is already verified');
  }
  try {
    const { status, valid } = await TwoFAService.sendCode(phoneNumber);
    if (user) {
      user.setPassword(generatePassword(installationId));
      user = await user.save(null, { useMasterKey: true });
    } else {
      user = await UserService.createUser(phoneNumber, installationId);
    }
    user.set('verificationStatus', status);
    user.set('verificationValid', valid);
    await user.save(null, { useMasterKey: true });
    return { status: 'code sent' };
  } catch (error) {
    throw new SendCodeError(`[Gr6JOan5] Cannot send code to ${phoneNumber}`);
  }
};

export default sendCode;
