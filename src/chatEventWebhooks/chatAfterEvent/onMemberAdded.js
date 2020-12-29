import ExtendableError from 'extendable-error-class';
import ChatService from '../../services/ChatService';
import Parse from '../../providers/ParseProvider';

class SetActiveStatusError extends ExtendableError {}
/**
 * EventType - string - Always onMemberAdded
 * MemberSid - string - The Member SID of the newly added Member
 * ChannelSid - string - Channel String Identifier
 * Identity - string
 *          - The Identity of the User being added to the channel as a Member
 * RoleSid - string, optional - The Role SID of added member
 * Reason - string
 *        - The reason for the addition of the member. Could be ADDED or JOINED
 * DateCreated - date string - The date of Member addition
 */
const onMemberAdded = async (request, response) => {
  try {
    const { ChannelSid, Identity } = request.body;
    const channel = await ChatService.fetchChannel(ChannelSid);
    const { createdBy } = channel;
    let messageSid;
    if (createdBy !== Identity) {
      // Retrieve the Parse user, to take the handle
      const user = await new Parse.Query(Parse.User)
        .equalTo('objectId', Identity)
        .first();

      if (!(user instanceof Parse.User)) {
        throw new SetActiveStatusError('[zIslmc6c] User not found');
      }

      // Create message structure
      const handle = user.get('handle');
      const message = {
        body: `[${handle}](${Identity}) joined the conversation.`,
        attributes: JSON.stringify({ context: 'status' }),
        from: Identity,
      };

      // Send the message
      const result = await ChatService.createMessage(message, ChannelSid);
      messageSid = result.sid;
    }
    return response.status(200).json({ messageSid });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

export default onMemberAdded;
