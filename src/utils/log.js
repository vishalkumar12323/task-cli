module.exports = function log(message, level = "info") {
  const icons = {
    info: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    file: "🔍",
  };

  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${icons[level]} ${message}`);
};
