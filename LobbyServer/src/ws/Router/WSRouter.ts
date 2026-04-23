import { WSRouter } from "../modules/WSRouter";
import { GetProfile } from "../events/GetProfile.event";
import { CreateLobby } from "../events/CreateLobby.event";
import { JoinToLobby } from "../events/JoinToLobby.event";
import { GetListOfLobby } from "../events/ListOfLobby.event";
import { getMyLobby } from "../events/GetMyLobby.event";
import { onPing } from "../events/OnPing.event";
import { startSession } from "../events/StartSession.event";
import { GetAvailableLobbies } from "../events/GetAvailableLobbies.event";
import { SubScribeMyLobbyEvents } from "../events/SubScribeMyLobbyEvents";
import { subscribeLobiesEvents } from "../events/SubScribeLobiesEvents"
import { UnsubScribeMyLobbyEvents } from "../events/UnsubScribeMyLobbyEvents.event";
import { UnubScribeLobiesEvents } from "../events/UnubScribeLobiesEvents.events";
import { CancelRequest } from "../events/CancelsearchingSessionRequest";
import { joinToLobbyByInviteCode, joinToLobbyRequest } from "../events/JoinToLobyRequest.event";
import { ApplyPlayerToJoin } from "../events/ApplyPlayerToJoin";


const WSrouter = new WSRouter();

WSrouter.on("ping", onPing)

WSrouter.on("GetProfile",GetProfile)
WSrouter.on("CreateLobby",CreateLobby)
WSrouter.on("JoinToLobby",JoinToLobby)
WSrouter.on("ListOfLobby",GetListOfLobby)
WSrouter.on("GetMyLobby",getMyLobby)
WSrouter.on("GetAvailableLobbies", GetAvailableLobbies)

WSrouter.on("StartSession", startSession)
WSrouter.on("CancelSearch", CancelRequest)

WSrouter.on("LobbyrequestToJoin", joinToLobbyRequest)
WSrouter.on("LobbyrequestToJoinByInviteCode", joinToLobbyByInviteCode)

WSrouter.on("ApplyPlayerJoinRequest", ApplyPlayerToJoin)

WSrouter.on("Events/SubScribeMyLobbyEvents",SubScribeMyLobbyEvents);
WSrouter.on("Events/SubScribeLobiesEvents",subscribeLobiesEvents);

WSrouter.on("Events/UnsubScribeMyLobbyEvents", UnsubScribeMyLobbyEvents);
WSrouter.on("Events/UnubScribeLobiesEvents", UnubScribeLobiesEvents);

export default WSrouter;