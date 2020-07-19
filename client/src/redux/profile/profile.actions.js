import ProfileActionTypes from "./profile.types";
import { SetAlert } from "../alert/alert.actions";
import axios from "axios";

export const ClearProfile = () => ({
  type: ProfileActionTypes.CLEAR_PROFILE,
});

export const FetchProfileStart = (uid) => (dispatch) => {
  dispatch({ type: ProfileActionTypes.FETCH_PROFILE_START });

  axios
    .post(`/api/profile/who/${uid}`)
    .then((res) =>
      dispatch({
        type: ProfileActionTypes.FETCH_PROFILE_SUCCESS,
        payload: res.data,
      })
    )
    .catch((error) =>
      dispatch(SetAlert({ message: error.response.data.error, type: "error" }))
    );
};

export const EditBio = (bio) => (dispatch) => {
  dispatch({ type: ProfileActionTypes.EDIT_BIO, payload: bio });

  axios
    .post("/api/profile/edit/bio", { bio: bio })
    .then((res) =>
      dispatch(SetAlert({ message: res.data.success, type: "success" }))
    )
    .catch((error) =>
      dispatch(SetAlert({ message: error.response.data.error, type: "error" }))
    );
};

export const EditPhotoStart = ({ formData }) => (dispatch) => {
  dispatch({ type: ProfileActionTypes.EDIT_PHOTO_START });

  axios
    .post("/api/profile/edit/photo", formData)
    .then((res) => {
      dispatch({ type: ProfileActionTypes.EDIT_PHOTO_END });
      dispatch(SetAlert({ message: res.data.success, type: "success" }));
    })
    .catch((error) => {
      dispatch({ type: ProfileActionTypes.EDIT_PHOTO_END });
      dispatch(SetAlert({ message: error.response.data.error, type: "error" }));
    });
};

export const EditSocialStart = (data) => (dispatch) => {
  dispatch({ type: ProfileActionTypes.EDIT_SOCIAL_START });

  axios
    .post("/api/profile/edit/social", { social: data })
    .then((res) => {
      dispatch({ type: ProfileActionTypes.EDIT_SOCIAL_SUCCESS, payload: data });
      dispatch(SetAlert({ message: res.data.success, type: "success" }));
    })
    .catch((error) => {
      dispatch({ type: ProfileActionTypes.EDIT_SOCIAL_FAILURE });
      dispatch(SetAlert({ message: error.response.data.error, type: "error" }));
    });
};

export const FollowStart = (profileId) => (dispatch) => {
  dispatch({ type: ProfileActionTypes.FOLLOW_START });

  axios
    .post(`/api/profile/follow/${profileId}`)
    .then((res) => {
      dispatch({ type: ProfileActionTypes.FOLLOW_SUCCESS, payload: res.data });
      dispatch(
        SetAlert({ message: "Following successfully.", type: "success" })
      );
    })
    .catch((error) => {
      dispatch({ type: ProfileActionTypes.FOLLOW_SUCCESS });
      dispatch(SetAlert({ message: error.response.data.error, type: "error" }));
    });
};