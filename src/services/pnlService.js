import api from "../config/api";

export async function savePnLDataToBackend(pnlData) {
  try {
    const response = await api.post("/api/pnl/save", {
      userId: pnlData.userId,
      stocks: pnlData.stocks,
      totalBalance: pnlData.totalBalance,
    });

    console.log("PnL data saved:", response.data);
  } catch (error) {
    console.error("Error saving PnL data:", error);
  }
}

export async function loadPnLDataFromBackend(userId) {
  try {
    const response = await api.get(`/api/pnl/${userId}`);

    if (response.data.success) {
      return response.data.pnl;
    }

    console.log("No PnL data found");
    return null;
  } catch (error) {
    console.error("Error loading PnL data:", error);
    return null;
  }
}
