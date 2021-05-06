/* eslint-disable no-console */

class Logging {
  static LogNewDay() {
    function newDayAnnouncement() {
      const now = new Date();
      const h = now.getHours();

      function announcement() {
        const fullDate = `${now.getDate()}.${now.getMonth()}.${now.getFullYear()}`;
        console.warn(`  Current Date: ${fullDate}`);
        console.log();
      }

      if (h !== 0) {
        clearInterval(this.NDLIID);
        Logging.LogNewDay();
        if (h < 3) {
          announcement();
        }
        return;
      }

      announcement();
    }
    // Gets what time is it - in order for it to be able to calculate when new day starts
    const now = new Date();
    const dh = 24 - now.getHours() - 1; // -1 accounts for minutes
    const dm = 60 - now.getMinutes() - 1; // -1 accounts for seconds
    const ds = 60 - now.getSeconds();

    const dms = dh * 60 * 60 * 1000 + dm * 60 * 1000 + ds * 1000;
    this.NDLIID = setTimeout(newDayAnnouncement, dms);
    setTimeout(function () {
      this.NDLIID = setInterval(newDayAnnouncement, 86400000);
    }, dms);
  }

  constructor() {
    // Initiates giveaway functions
    this.NDLIID = setTimeout(this.newDayAnnouncement, 0);
  }
}
exports.Logging = Logging;
