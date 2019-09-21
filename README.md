# Node Vault Scratch Container

## Pull Docker image
```
docker pull gcr.io/hippo-analytics/node:0.1.0
```
or
```
docker pull gcr.io/hippo-analytics/node:latest
```

## Environment Variables

|Environment Variable|Type|Example Value|Required|
|---|---|---|---|
|VAULT_ENABLED|bool|true/false|defaults to false|
|VAULT_PATHS|JSON list(string)|[\"/preproduction/data/example/config\"]|required if VAULT_ENABLED=true|
|VAULT_TOKEN|string|s.0123456789abcdefghijklmn|required if VAULT_ENABLED=true|
|VAULT_ADDR|string (hostname)|https://vault.example.com:8200|required if VAULT_ENABLED=true|

## Building the Project

### Build Docker
```
npm run docker:build
```

### Push Docker
```
npm run docker:push
```

### Examine Config in Pod Running on Kubernetes

To get the configuration before vault is called
```
kubectl exec <pod_name> -n <namespace> -- node -e "console.log(process.env)"
```

To get the configuration after vault is called
```
kubectl exec <pod_name> -n <namespace> -- node /usr/src/app/bootstrap.js node -e 'console.log(process.env)'
```

##### This is due to kubectl exec allowing for the entrypoint to be bypassed.