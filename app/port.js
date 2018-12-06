import Evented from '@ember/object/evented';
import EmberObject, { computed } from '@ember/object';

export default EmberObject.extend(Evented, {
  applicationId: undefined,

  detectedApplications: computed(function() {
    return [];
  }),

  init() {
    this.get('adapter').onMessageReceived(message => {
      if (message.type !== 'app-list') {
        return;
      }

      this.set('detectedApplications', message.appList.mapBy('name'));
    });

    this.get('adapter').onMessageReceived(message => {
      if (!message.applicationId) {
        return;
      }
      if (!this.get('applicationId')) {
        this.set('applicationId', message.applicationId);
      }

      const applicationId = this.get('applicationId');
      if (applicationId === message.applicationId) {
        this.trigger(message.type, message, applicationId);
      }
    });
  },
  send(type, message) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    message.applicationId = this.get('applicationId');
    this.get('adapter').sendMessage(message);
  }
});
