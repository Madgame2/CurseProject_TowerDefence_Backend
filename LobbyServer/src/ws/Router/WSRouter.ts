import { WSRouter } from "../modules/WSRouter";
import { GetProfile } from "../events/GetProfile.event";
import { CreateLobby } from "../events/CreateLobby.event";
import { JoinToLobby } from "../events/JoinToLobby.event";
import { GetListOfLobby } from "../events/ListOfLobby.event";
import { getMyLobby } from "../events/GetMyLobby.event";

const WSrouter = new WSRouter();

WSrouter.on("GetProfile",GetProfile)
WSrouter.on("CreateLobby",CreateLobby)
WSrouter.on("JoinToLobby",JoinToLobby)
WSrouter.on("ListOfLobby",GetListOfLobby)
WSrouter.on("GetMyLobby",getMyLobby)

export default WSrouter;