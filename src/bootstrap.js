const { spawnSync } = require("child_process");
const vault = require("node-vault")({
  apiVersion: "v1",
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});
const isVaultEnabled = function() {
  return (
    !!process.env.VAULT_ENABLED &&
    process.env.VAULT_ENABLED.toLowerCase() === "true"
  );
};

const read = async function() {
  if (!isVaultEnabled()) {
    return Promise.resolve();
  }

  let configs = await Promise.all(
    JSON.parse(process.env.VAULT_PATHS).map(path =>
      vault
        .read(path)
        .then(result => result.data.data)
        .catch(err => {
          console.log(err);
          process.exit(1);
        })
    )
  );

  let result = {};

  configs.forEach(conf => {
    result = {
      ...result,
      ...conf
    };
  });

  return result;
};

read()
  .then(result => {
    let command = process.argv;
    command.shift();
    command.shift();
    let childArgs = command;
    let childCommand = childArgs.shift();
    console.log(
      `Bootstrapping: '${childCommand}' with args: '${childArgs.join(" ")}'`
    );
    let child = spawnSync(childCommand, childArgs, {
      cwd: __dirname,
      env: {
        ...process.env,
        ...result,
        VAULT_ENABLED: false,
        VAULT_TOKEN: '',
        VAULT_ADDR: '',
        VAULT_PATHS: ''
      },
      detached: false,
      uid: process.getuid(),
      gid: process.getgid(),
      stdio: ["ignore", "inherit", "inherit"]
    });
    console.log(`Finished running ${process.argv.join(" ")}`);
    console.log(
      `{"pid": ${child.pid}, "status": "${child.status}", "signal": "${child.signal}", "error": "${child.error}"}`
    );
    process.exit(child.status);
  })
  .catch(error => {
    const msg = "UNCAUGHT EXCEPTION: " + error.message + "";
    console.log("error", "unhandledError", {
      type: "unhandledError",
      message: msg
    });
  });
