export type UploadNewUserDataDto = {
  userId: string;
  nickName: string;
  newImage?: number[] | null; // byte[] из Unity
};