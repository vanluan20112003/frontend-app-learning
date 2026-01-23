import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  close: {
    id: 'general.altText.close',
    defaultMessage: 'Đóng',
    description: 'Text used as an aria-label to describe closing or dismissing a component',
  },
  registerLowercase: {
    id: 'learning.logistration.register', // ID left for historical purposes
    defaultMessage: 'đăng ký',
    description: 'Text in a link, prompting the user to create an account.  Used in "learning.logistration.alert"',
  },
  signInLowercase: {
    id: 'learning.logistration.login', // ID left for historical purposes
    defaultMessage: 'đăng nhập',
    description: 'Text in a link, prompting the user to log in.  Used in "learning.logistration.alert"',
  },
  signInSentenceCase: {
    id: 'general.signIn.sentenceCase',
    defaultMessage: 'Đăng nhập',
    description: 'Text in a button, prompting the user to log in.',
  },
});

export default messages;
