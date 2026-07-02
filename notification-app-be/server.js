const app = require("./app");
const { Log } = require("./utils/logger");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  Log(null, "INFO", "backend.server", `Server is running and listening on port ${PORT}`);
});
