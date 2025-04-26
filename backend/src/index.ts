import dotenv from "dotenv";
dotenv.config();
import { app } from "./express/server";
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
