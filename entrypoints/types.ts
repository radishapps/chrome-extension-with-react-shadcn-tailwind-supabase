export enum MessageType {
    clickExtIcon = "clickExtIcon",
    changeTheme = "changeTheme",
    changeLocale = "changeLocale",
    signInWithGoogle = "sign-in-with-google",
    authStateChanged = "auth-state-changed",
    signInSuccess = "sign-in-success",
    fetchExperiences = "fetchExperiences",
    updateExperience = "updateExperience"
}

export enum MessageFrom {
    contentScript = "contentScript",
    background = "background",
    popUp = "popUp",
    sidePanel = "sidePanel",
}

class ExtMessage {
    content?: string | Record<string, any>;
    from?: MessageFrom;
    type?: string;
    signedIn?: boolean;

    constructor(messageType: MessageType) {
        this.messageType = messageType;
    }

    messageType: MessageType;
}

export default ExtMessage;
