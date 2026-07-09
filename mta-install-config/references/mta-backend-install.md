# MTA Backend Platform Sizing & Installation Guide

This document describes the sizing requirements, environment configuration, and installation steps for hosting the Menditect Test Automation (MTA) platform.

---

## 🔗 Core Mendix Marketplace Location

The private backend platform requires an active subscription and can be downloaded from the Mendix Marketplace:

*   **MTA Platform (Private, License Required):** [Mendix Marketplace Component 225791](https://marketplace.mendix.com/link/component/225791)

---

## 🚫 Sizing & System Requirements

If your Menditect license includes hosted MTA, installation is managed completely by Menditect. 

For on-premises, custom clouds (Cloud Foundry, Kubernetes, etc.), or private Mendix Cloud deployments, you **MUST** ensure the following hardware requirements are met:

*   **Mendix Cloud Resource Pack:** Requires at least an **M21-STANDARD** resource pack.
*   **RAM Sizing Constraints:** You **MUST** assign:
    *   **At least 4 GB of RAM** for the App Container.
    *   **At least 4 GB of RAM** for the Database.
    *   **At least 1 CPU core**.
*   > [!CAUTION]
    > **Do NOT allocate fewer resources than specified!** Assigning fewer resources dramatically increases the risk of spontaneous Mendix application crashes and out-of-memory restarts due to long-running test execution/compilation processes.

---

## ⚙️ Environment Variables & Constants Configuration

During MDA deployment to your target environment, you **MUST** verify and configure the following Mendix constant values to ensure clean connection handshakes:

| Environment Constant (Variable) | Value / Setting | Description |
| :--- | :--- | :--- |
| `ApiMendixModule.WebsocketStage` | `production` | Enables real-time socket messaging. |
| `EgalitConfigModule.EsaMultiInstanceMode` | `False` | Keeps single-instance database safety. |
| `MtaDataValidationModule.RunIntervalNrOfDaysBeforeSysdate` | `5` | History validation duration constraint. |
| `MtaUtils.DeleteObjectBatchSize` | `500` | Limits batch sizes to prevent DB locking. |
| `MtaUtils.DeploymentType` | `On-Premises` | Identifies hosting model environment. |
| `MtaUtils.InternalToken` | *(empty)* | Optional system security token. |
| `MtaUtils.NodeRevision` | `0` | Active cluster node revision index. |
| `MtaUtils.ScheduledEventsOffsetUTC` | *(integer offset from UTC)* | Offsets the scheduled events timing in whole hours. |
| `MtaUtils.UrlBaseDocumentation` | `https://documentation.menditect.com` | Base path for platform support. |

---

## 🔍 Success Verification Checklist

To verify that the infrastructure provisioning step was successful, complete this checklist:

1.  **Dashboard Load Test:** Open the browser and navigate to the backend host URL (localhost or custom domain). Verify the login portal loads within **5 seconds** without gateway timeouts (502/504).
2.  **Resource Allocation Audit:** Verify via your container console (e.g. Mendix Portal, Docker, or Kubernetes dashboard) that the Application Container is running with **4 GB RAM** or more, and has not logged any `OOMKilled` (Out of Memory) crash codes.
3.  **Bootstrap Log Verification:** Inspect your application server logs and verify that the database schema creation has completed successfully. Look for:
    *   `MtaUtils: Bootstrap completed successfully.`
    *   No occurrences of duplicate key exceptions or table sync failures.

---

## 📅 Troubleshooting New Installations

*   **Fresh DB Cleanliness:** When installing MTA for the first time, you **MUST** ensure that the database and Mendix model of any conflicting mock servers are fully cleaned up first to prevent schema syncing or duplicate key exceptions during initial bootstrap.
