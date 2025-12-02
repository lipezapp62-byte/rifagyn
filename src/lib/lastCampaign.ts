const KEY = "last_campaign_url";

export function saveLastCampaign(url: string) {
    try {
        localStorage.setItem(KEY, url);
    } catch { }
}

export function getLastCampaign() {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
}
