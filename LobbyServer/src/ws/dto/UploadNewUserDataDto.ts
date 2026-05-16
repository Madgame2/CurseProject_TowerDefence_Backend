export type UploadNewUserDataDto = {
  userId: string;
  nickName: string;
  newImage?: string;  // byte[] из Unity
};