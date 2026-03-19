import app from "./app"
import {CONFIG} from "./config/config"


app.listen(CONFIG.server.port, ()=>{
    console.log(`Server running on port ${CONFIG.server.port}`);
})
