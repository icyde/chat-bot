import React from 'react';

export const createUser = async (setErrors) => {
  //Return user object after creation in freshchat
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  };
  try {
    const res = await fetch("/api/user", requestOptions);
    console.log(res)
    if (res.ok){
      return res.json();
    }
    else{
      setErrors(
        "There has been an error, please refresh the page or contact an administrator."
      );
      return res;
    }
  } catch (error) {
    console.log(error);
    setErrors(
      "There has been an error, please refresh the page or contact an administrator."
    );
    return error;
  }
}

export const getGroup = async (setErrors) => {
  //get groupId
  try {
    const res = await fetch("/api/groups");
    if (res.ok) {
      return res.json();
    } else {
      setErrors(
        "There has been an error, please refresh the page or contact an administrator."
      );
      return res;
    }
  } catch (error) {
    console.log(error);
    setErrors(
      "There has been an error, please refresh the page or contact an administrator."
    );
    return error;
  }
}

export const getChannel = async (setErrors) => {
  //get channelId
  try {
    const res = await fetch("/api/channels");
    if (res.ok) {
      return res.json();
    } else {
      setErrors(
        "There has been an error, please refresh the page or contact an administrator."
      );
      return res;
    }
  } catch (error) {
    console.log(error);
    setErrors(
      "There has been an error, please refresh the page or contact an administrator."
    );
    return error;
  }
};

export const createConversation = async(setErrors, body) =>{
  //get conversationId
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
  try {
    const res = await fetch("/api/conversations", requestOptions);
    if (res.ok) {
      console.log("convo",res)
      return res.json();
    } else {
      setErrors(
        "There has been an error, please refresh the page or contact an administrator."
      );
      return res;
    }
  } catch (error) {
    console.log(error);
    setErrors(
      "There has been an error, please refresh the page or contact an administrator."
    );
    return error;
  }

}

