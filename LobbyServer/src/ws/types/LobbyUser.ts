

export class LobbyUser{
    id :string
    NickName: string
    HeaderImage: string

    constructor(id:string, nickName:string, HeaderImage:string){
        this.id = id
        this.NickName = nickName
        this.HeaderImage = HeaderImage;
    }
}