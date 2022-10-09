# object-storage-browser

### Outline
This project can support to access object storage based in Amazon Simple 3 Stardard in browser. Normal operation can be supported such as list bucket, create bucket, delete bucket, list objects, upload objects and delete object.

### Docker Image
#### Docker Image Link 
https://hub.docker.com/r/qiandu/obs-browser

#### Start Docker

```
sudo docker run -d --name obs-browser --net host --restart always qiandu/obs-browser:1.0.0
```
Default administrator account and password are: `obs-admin` and `ChangePasswrd`. 
Default port is 20000, you can use environment variables `SERVER_HOST` and `SERVER_PORT` to modify domain.

#### UI
UI Project Address:
