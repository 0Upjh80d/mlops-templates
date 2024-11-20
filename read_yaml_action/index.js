import core from "@actions/core";
import yaml from "js-yaml";
import { promises as fs } from "fs";

checkGenerateEntity();

try {
  const configData = core.getInput("config");
  if (!configData) {
    core.setFailed("Configuration file path is required.");
  } else {
    (async () => {
      const data = await fs.readFile(configData, "utf8");
      const SCHEMA = yaml.FAILSAFE_SCHEMA;
      const configYaml = yaml.load(data, { schema: SCHEMA });

      const { variables } = configYaml;
      const namespace = String(variables.namespace || "");
      const postfix = String(variables.postfix || "");
      const environment = String(variables.environment || "");
      const enable_aml_computecluster = Boolean(
        variables.enable_aml_computecluster
      );
      const enable_monitoring = Boolean(variables.enable_monitoring);
      let resource_group = String(variables.resource_group || "");
      const location = String(variables.location || "");
      let aml_workspace = String(variables.aml_workspace || "");

      const terraform_version = String(variables.terraform_version || "");
      const terraform_workingdir = String(variables.terraform_workingdir || "");
      let terraform_st_location = String(variables.terraform_st_location || "");
      let terraform_st_resource_group = String(
        variables.terraform_st_resource_group || ""
      );
      let terraform_st_storage_account = String(
        variables.terraform_st_storage_account || ""
      );
      const terraform_st_container_name = String(
        variables.terraform_st_container_name || ""
      );
      const terraform_st_key = String(variables.terraform_st_key || "");

      // Conditional entity assignments
      resource_group = checkGenerateEntity(resource_group)
        ? `rg-${namespace}-${postfix}${environment}`
        : resource_group;

      aml_workspace = checkGenerateEntity(aml_workspace)
        ? `mlw-${namespace}-${postfix}${environment}`
        : aml_workspace;

      terraform_st_location = checkGenerateEntity(terraform_st_location)
        ? location
        : terraform_st_location;

      terraform_st_resource_group = checkGenerateEntity(
        terraform_st_resource_group
      )
        ? `rg-${namespace}-${postfix}${environment}-tf`
        : terraform_st_resource_group;

      terraform_st_storage_account = checkGenerateEntity(
        terraform_st_storage_account
      )
        ? `st${namespace}${postfix}${environment}tf`
        : terraform_st_storage_account;

      const batch_endpoint_name = `bep-${namespace}-${postfix}${environment}`;
      const online_endpoint_name = `oep-${namespace}-${postfix}${environment}`;

      setOutput({
        location,
        namespace,
        postfix,
        environment,
        enable_monitoring,
        enable_aml_computecluster,
        resource_group,
        aml_workspace,
        bep: batch_endpoint_name,
        oep: online_endpoint_name,
        terraform_version,
        terraform_workingdir,
        terraform_st_location,
        terraform_st_resource_group,
        terraform_st_storage_account,
        terraform_st_container_name,
        terraform_st_key,
      });
    })().catch((error) =>
      core.setFailed(`Action failed with error: ${error.message}`)
    );
  }
} catch (error) {
  core.setFailed(`Action failed with error: ${error.message}`);
}

// Utility function to check if the entity should be generated
function checkGenerateEntity(entity) {
  return String(entity).includes("$") || !entity;
}

// Utility function to set multiple outputs
function setOutput(outputs) {
  Object.entries(outputs).forEach(([key, value]) => core.setOutput(key, value));
}
