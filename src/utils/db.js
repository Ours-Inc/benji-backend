import ExtendableError from 'extendable-error-class';
import Parse from '../providers/ParseProvider';

const Config = require('parse-server/lib/Config');

class DbUtilError extends ExtendableError {}

function getDatabaseInstance() {
  const config = Config.get(Parse.applicationId);
  const { database } = config.database.adapter;
  return database;
}

/**
 * Simulate sequence nextval() on relational db's.
 *
 * @param {String} sequenceOfName
 */
const getValueForNextSequence = async sequenceOfName => {
  try {
    const db = getDatabaseInstance();

    const sequences = db.collection('_sequences'); // returns new instance of _sequences if collections doesn't exists.
    const { value } = await sequences.findOneAndUpdate(
      { _id: sequenceOfName },
      { $inc: { sequence_value: 1 } },
      { upsert: true },
    );
    return !value ? 1 : value.sequence_value + 1;
  } catch (error) {
    throw new DbUtilError(error.message);
  }
};

/** *
 * Decrement by 1 the value for the given sequence.
 *
 * @param {String} sequenceOfName
 */
const getPreviousValueForSequence = async sequenceOfName => {
  try {
    const db = getDatabaseInstance();

    const sequences = db.collection('_sequences'); // returns new instance of _sequences if collections doesn't exists.
    const { value } = await sequences.findOneAndUpdate(
      { _id: sequenceOfName },
      { $inc: { sequence_value: -1 } },
      { upsert: true },
    );
    return !value ? 0 : value.sequence_value - 1;
  } catch (error) {
    throw new DbUtilError(error.message);
  }
};

/**
 * Read sequence current value.
 *
 * @param {String} sequenceOfName
 */
const getCurrentValueSequence = async sequenceOfName => {
  try {
    const db = getDatabaseInstance();

    const sequences = db.collection('_sequences'); // returns new instance of _sequences if collections doesn't exists.
    const result = await sequences.findOne({ _id: sequenceOfName });
    return result ? result.sequence_value : result;
  } catch (error) {
    throw new DbUtilError(error.message);
  }
};

export default {
  getDatabaseInstance,
  getValueForNextSequence,
  getCurrentValueSequence,
  getPreviousValueForSequence,
};
