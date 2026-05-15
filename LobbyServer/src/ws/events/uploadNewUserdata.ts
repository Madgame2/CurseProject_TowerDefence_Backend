import { Player } from "../../models/player.entity";
import { WSEvent } from "../../types/WSEvent";
import { WSResponse } from "../../types/WSResponse";
import { UploadNewUserDataDto } from "../dto/UploadNewUserDataDto";
import { WSContext } from "../types/WSContext";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import lobbyService from "../Services/LobbyService/Lobby.Service";


const BASE_URL =
    process.env.BASE_URL ||
    `http://localhost:${process.env.PORT || 3000}`;

export const UploadNewUserData = async (ctx: WSContext) => {
    try {
        console.log(ctx.message);
        const data = ctx.message?.payload as UploadNewUserDataDto;

        if (!data?.userId) {
            const err: WSResponse ={
                code:404,
                requestId: ctx.message?.requestId!
            }
            ctx.ws.send(JSON.stringify(err));
            return;
        }

        const user = await Player.findByPk(data.userId);
        if (!user) {
            const err: WSResponse ={
                code:404,
                requestId: ctx.message?.requestId!
            }
            ctx.ws.send(JSON.stringify(err));
            return;
        }

        if (data.nickName) {
            user.nickname = data.nickName;
        }

        if (data.newImage && data.newImage.length > 0) {

            const buffer = Buffer.from(data.newImage);

            // папка хранения
            const uploadDir = path.join(process.cwd(), "uploads/avatars");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // уникальное имя файла
            const fileName = `${uuid()}.png`;

            const filePath = path.join(uploadDir, fileName);

            // сохраняем файл
            fs.writeFileSync(filePath, buffer);

            // формируем URL
            const avatarUrl = `${BASE_URL}/uploads/avatars/${fileName}`;

            user.headerImageSource = avatarUrl;
        }

        await user.save();

        const res :WSResponse = {
            code:200,
            requestId: ctx.message?.requestId!
        }
        ctx.ws.send(JSON.stringify(res));

        const event :WSEvent ={
            action: "ProfileUpdated",
            data: user
        }
        ctx.ws.send(JSON.stringify(event));

        const LobbyID = await lobbyService.GetUserLobbyObj(ctx.userId!)
        lobbyService.NofifyLobbyPUserProfileUpdate(LobbyID?.id!, user)

    } catch (err) {
        console.error("UploadNewUserData error:", err);

        const Messerr: WSResponse ={
                code:500,
                requestId: ctx.requestId
            }
        ctx.ws.send(JSON.stringify(Messerr));
    }
};