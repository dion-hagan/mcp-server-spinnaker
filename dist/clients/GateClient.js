import WebSocket from 'ws';
export class GateClient {
    constructor(baseUrl) {
        this.ws = null;
        this.baseUrl = baseUrl;
    }
    // Pipeline Operations
    async listPipelines(application) {
        const response = await fetch(`${this.baseUrl}/applications/${application}/pipelines`);
        return response.json();
    }
    async getPipeline(application, pipelineId) {
        const response = await fetch(`${this.baseUrl}/applications/${application}/pipelines/${pipelineId}`);
        return response.json();
    }
    async executePipeline(application, pipelineId, params) {
        const response = await fetch(`${this.baseUrl}/pipelines/${application}/${pipelineId}`, {
            method: 'POST',
            body: JSON.stringify(params || {})
        });
        const { ref } = await response.json();
        return ref; // Returns execution ID
    }
    async cancelPipeline(executionId) {
        await fetch(`${this.baseUrl}/pipelines/cancel/${executionId}`, {
            method: 'PUT'
        });
    }
    async pausePipeline(executionId) {
        await fetch(`${this.baseUrl}/pipelines/pause/${executionId}`, {
            method: 'PUT'
        });
    }
    // Deploy History Operations
    async getDeployHistory(filters) {
        const queryParams = new URLSearchParams(filters);
        const response = await fetch(`${this.baseUrl}/deploy-history?${queryParams}`);
        return response.json();
    }
    async getLastDeploy(environment, application) {
        const history = await this.getDeployHistory({
            environment,
            application
        });
        return history[0]; // Assuming sorted by date desc
    }
    // Snapshot Operations
    async getSnapshots(application) {
        const response = await fetch(`${this.baseUrl}/snapshots/${application}`);
        return response.json();
    }
    async getSnapshotByDetails(application, sha, branch) {
        const response = await fetch(`${this.baseUrl}/snapshots/${application}/${sha}/${branch}`);
        return response.json();
    }
    async executePipelineFromSnapshot(application, pipelineId, snapshotId) {
        const response = await fetch(`${this.baseUrl}/pipelines/${application}/${pipelineId}`, {
            method: 'POST',
            body: JSON.stringify({ snapshotId })
        });
        const { ref } = await response.json();
        return ref;
    }
    // WebSocket for real-time updates
    watchPipelineExecution(executionId, onUpdate) {
        this.ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/pipelines/exec/${executionId}`);
        this.ws.on('message', (data) => {
            const execution = JSON.parse(data);
            onUpdate(execution);
        });
    }
    // Debug helper
    async getPipelineExecutionDetails(executionId) {
        const response = await fetch(`${this.baseUrl}/pipelines/execution/${executionId}`);
        return response.json();
    }
}
//# sourceMappingURL=GateClient.js.map