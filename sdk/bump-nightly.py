import subprocess

def bump_javascript(commit_hash: str):
    file_contents: str = ""
    with open("./javascript/package.json", "r") as file:
        for current_line in file:
            if current_line.strip().startswith('"version"'):
                file_contents += current_line[:len(current_line)-3] + "-" + commit_hash + '",\n'
                continue

            file_contents += current_line
    
    with open("./javascript/package.json", "w") as file:
        file.write(file_contents)

def bump_dotnet(commit_hash: str):
    file_contents: str = ""
    with open("./dotnet/Pesto/Pesto.csproj", "r") as file:
        for current_line in file:
            if current_line.strip().startswith('<Version>'):
                file_contents += current_line[:len(current_line)-11] + "-" + commit_hash + '</Version>\n'
                continue

            file_contents += current_line
    
    with open("./dotnet/Pesto/Pesto.csproj", "w") as file:
        file.write(file_contents)

def main():
    current_git_commit: str = subprocess.getoutput("git rev-parse --short HEAD", encoding="utf8")
    
    bump_javascript(current_git_commit)
    bump_dotnet(current_git_commit)
    

if __name__ == "__main__":
    main()
