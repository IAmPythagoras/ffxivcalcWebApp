"""
This is a custom stream object from logging. It will take the logs and when printed it
flushs them. This will be displayed to the user in case of an issue.
"""
class LogStream(object):
    def __init__(self):
        self.logs = []
        self.ReturnCode = 0  # There are 3 return codes.
                             # 0 is a success
                             # 1 is a successful simulation, but with a failed requirement that was ignored
                             # 2 is a failed simulation
    def write(self, str):
                             # We will evaluate the level of the log and change the ReturnCode accordingly.
        str_split = str.split(":")

        if (str_split[1].split(".")[0] == "ffxivcalc"): 
            if (str_split[0] == "WARNING"):
                self.ReturnCode = 1
            elif (str_split[0] == "CRITICAL"):
                self.ReturnCode = 2

            self.logs += [str]
    def flush(self):
        pass

    def to_str(self):
        saved_logs = self.logs
                             # Reseting the stream
        self.logs = []
        self.ReturnCode = 0
        return saved_logs
    


    