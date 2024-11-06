// See https://aka.ms/new-console-template for more information
using System;
using System.IO;

class Program
{
    private static Timer _timer;
    private static FileSystemEventArgs _eventArgs;
    private static FileInfo _lastFileInfo;


    static void Main(string[] args)
    {
        if (args.Length < 1)
        {
            Console.WriteLine("FATAL :: Please specify video folder path");
            Console.WriteLine("Example Usage:");
            Console.WriteLine("watcher.exe <video folder path>");
            return;
        }
        foreach (string arg in args)
            Console.WriteLine(arg);

        FileSystemWatcher watcher = new FileSystemWatcher();
        
        //watcher.Path = @"J:\learning\videoSol\videos";
        watcher.Path = args[0];
        watcher.NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite;
        watcher.Filter = "*.mp4";

        watcher.Created += OnChanged;
        watcher.Deleted += OnChanged;
        watcher.Changed += OnChanged;
        watcher.Renamed += OnRenamed;
        watcher.WaitForChanged(WatcherChangeTypes.All);

        watcher.EnableRaisingEvents = true;

        Console.WriteLine("Watching directory: " + watcher.Path);
        Console.WriteLine("Press 'q' to quit.");
        while (Console.Read() != 'q') ;
    }

    private static void OnChanged(object source, FileSystemEventArgs e)
    {
            Console.WriteLine("triggering for file" + e.FullPath + e.ChangeType);
        if (e.ChangeType == WatcherChangeTypes.Changed)
        {
            _eventArgs = e;
            _timer?.Dispose();
            _timer = new Timer(OnTimeout, null, 1000, Timeout.Infinite); // Adjust the delay as needed
            
        }      
       
    }

    private static async void OnTimeout(object state)
    {
        
        // Check if the file size is stable
        var currentFileInfo = new FileInfo(_eventArgs.FullPath);
        if (_lastFileInfo == null || _lastFileInfo.Length != currentFileInfo.Length)
        {
            _lastFileInfo = currentFileInfo;
            _timer = new Timer(OnTimeout, null, 1000, Timeout.Infinite); // Restart the timer
        }
        else
        {
            // File size is stable, consider the change as finished
            Console.WriteLine($"uploading... File: {_eventArgs.FullPath} {_eventArgs.ChangeType} - Change finished.");
            await UploadVideoAsync(_eventArgs.FullPath);
        }
    }
    


    private static async Task UploadVideoAsync(String path)
    {
        var client = new HttpClient();
        var request = new HttpRequestMessage(HttpMethod.Post, "http://localhost:3000/upload");

        var content = new MultipartFormDataContent();
        var fileStream = File.OpenRead(path);
        var streamContent = new StreamContent(fileStream);

        // Set the MIME type to video
        streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("video/mp4");

        content.Add(streamContent, "video", Path.GetFileName(path));
        request.Content = content;

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();
        Console.WriteLine(await response.Content.ReadAsStringAsync());

        fileStream.Dispose(); // Make sure to dispose of the file stream
    }


private static void OnRenamed(object source, RenamedEventArgs e)
    {
        Console.WriteLine($"File renamed: {e.OldFullPath} to {e.FullPath}");
    }
}
