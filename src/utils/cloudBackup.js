const { exec } = require("child_process");

// Replace `<local_db_name>` and `<cloud_db_connection_string>` with your actual values
const localDbName = "lottery";

// Function to copy data from local to cloud MongoDB
function copyDataToCloud(
  connection = "mongodb+srv://iconiq:Code.Unknown07@cluster0.wwv3kva.mongodb.net/lottery?retryWrites=true&w=majority"
) {
  exec(
    `mongodump --db ${localDbName} && mongorestore --uri="${connection}" -d lottery dump/lottery --drop`,
    (error, stdout, stderr) => {
      if (error) {
        console.error("Data copy failed:", error);
      } else {
        console.log("Data copied successfully to cloud MongoDB");
      }
    }
  );
}

module.exports = {
  copyDataToCloud,
};
