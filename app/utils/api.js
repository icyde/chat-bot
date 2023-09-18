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
    return res.json();
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
    return res.json();
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
    return res.json();
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
    return res.json();
  } catch (error) {
    console.log(error);
    setErrors(
      "There has been an error, please refresh the page or contact an administrator."
    );
    return error;
  }

}

