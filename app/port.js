import Evented from '@ember/object/evented';
import EmberObject from '@ember/object';

export default EmberObject.extend(Evented, {
  applicationId: undefined,
  applicationName: undefined,

  init() {
    const addIfNotPresent = (list, value) => {
      if (list.indexOf(value) === -1) {
        list.pushObject(value);
      }
    };

    this._super(...arguments);

    /*
     * An array of objects of the form:
     * { applicationId, applicationName }
     */
    this.detectedApplications = [];

    this.get('adapter').onMessageReceived(message => {
      const { applicationId, applicationName } = message;

      if (message.type === 'app-list') {
        message.appList.forEach(app => addIfNotPresent(this.detectedApplications, app));
        return;
      }

      if (!applicationId) {
        return;
      }

      if (!this.applicationId) {
        this.set('applicationId', applicationId);
      }

      // save list of application ids
      if (!this.detectedApplications.mapBy('applicationId').includes(applicationId)) {
        this.detectedApplications.push({ applicationId, applicationName });
      }

      if (this.applicationId === applicationId) {
        this.trigger(message.type, message, applicationId);
      }
    });
  },
  send(type, message) {
    message = message || {};
    message.type = type;
    message.from = 'devtools';
    message.applicationId = this.applicationId;
    message.applicationName = this.applicationName;
    this.get('adapter').sendMessage(message);
  }
});
