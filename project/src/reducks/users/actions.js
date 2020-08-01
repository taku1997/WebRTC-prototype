export const SIGN_IN = "SIGN_IN";
export const SIGN_OUT = "SIGN_OUT";

export const signInAction = (userState) => {
  return {
    type: "SIGN_IN",
    payload: {
      isSignedIn : true,
      username: userState.username,
      uid: userState.uid
    }
  }
};


export const signOutAction = () => {
  return {
    type: "SIGN_OUT",
    payload: {
      isSignedIn : false,
      username: "",
      uid: ""
    }
  }
};