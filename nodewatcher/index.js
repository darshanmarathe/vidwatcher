const chokidar = require('chokidar');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Function to watch a directory
function watchDirectory(dirPath) {
    // Initialize the watcher
    const watcher = chokidar.watch(dirPath, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
    });

    // Add event listeners
    watcher
        .on('add', path => console.log(`File ${path} has been added`))
        .on('change', path => {
            console.log(`File ${path} has been changed`)
            Upload(path)
        })
        .on('unlink', path => console.log(`File ${path} has been removed`))
        .on('error', error => console.log(`Watcher error: ${error}`));

    console.log(`Watching directory: ${dirPath}`);
}

// Get the directory path from command line arguments
const dirPath = process.argv[2];
if (!dirPath) {
    console.error('Please provide a directory path');
    process.exit(1);
}

// Start watching the directory
watchDirectory(dirPath);


async function Upload(fileName) {
    let data = new FormData();
data.append('video', fs.createReadStream(fileName));

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:3000/upload',
  headers: { 
    ...data.getHeaders()
  },
  data : data
};

axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

}