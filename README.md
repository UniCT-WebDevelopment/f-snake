# Fsnake

Fsnake is a web app that let you play snake in single player, against the AI, or just watch the AI play

## AI

The AI is implemented in javascript using A* search algorithm, it will take the position of the snake's head as a starting position, the food position as goal, the direction of the snake and the body of the snake.
The snake's body is passed to be treated as an obstacle.

A* will return an array of positions which will be translate in actions in the game function (draw).
On the website you can choose which heuristic will be used to calculate the optimal path: Manhattam distance or Euclidean distance, the former will generate more "linear" paths whilst the latter will generate more "zig-zag" paths.

At the beginning of the game A* will perform rather well, but progressing in the game will result in a longer body thus longer paths are needed to avoid colliding against it.
A* will take longer to compute as the game goes on, to avoid waiting for it to finish, it will return a path as soon as a refresh interval of the game has passed, piking up the state in the frontier set with the lowest f (where f is the distance to the goal + the distance to reach that state)

## Backend & database

Fsnake is implemented using Flask and SqlAlchemy.
The database has 2 tables: User and Score, you can find those in the models.py file: 

```
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    scores = db.relationship('Score', backref='player', lazy=True)

    def __repr__(self):
        return f"User('{self.username}')"

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)
    Type = db.Column(Enum(MyEnum), nullable=False)
    date_score = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"User('{self.score}','{self.player.username}','{self.Type}', '{self.date_score}')"
```
## Installation

to run Fsnake you will need to install pip and install the requirements listed in the "requirement.txt" file via pip

```
sudo apt install python3-pip
sudo apt install python3-venv
python3 -m venv fsnake/venv
cd fsnake
source venv/bin/activate
pip install -r requirements.txt
```

### Run in debug mode

to run in debug mode just
```
python run.py
```
and flask will serve it at the localhost address with it's default port 5000: 127.0.0.1:5000

### Run exposing it to the web

```
export FLASK_APP=run.py
flask run --host=0.0.0.0
```

and the web app will be available to your ip address at 5000 port

### Deploy

You can deploy the web app using nginx as web server, and gunicorn to run the python code:

```
sudo apt install nginx
pip install gunicorn
sudo rm /etc/nginx/sites-enable/default
sudo nano /etc/nginx/sites-enable/fsnake
```

and write the following line:

```
server {
	listen 80;
	server_name *your ip address*;
	
	location /static {
		alias *path to the fsnake folder*/fsnake/fsnake/static;
	}

	location / {
		proxy_pass http://localhost:8000;
		include /etc/nginx/proxy_params;
		proxy_redirect off;
	}
}
```

modify firewall rules with ufw:

```
sudo apt install ufw
sudo ufw allow http/tcp
sudo ufw enable
sudo systemctl restart nginx
```

To run Gunicorn go to fsnake directory:

```
gunicorn -w 9 run:app
```

-w is the number of workers, calculated by (2 x num_cores) + 1

at this point if gunicorn is stopped, the python code will not run, in order to check gunicorn and restart it if stopped install supervisor:


```
sudo apt install supervisor
```

and setup configuration file for supervisor
```
sudo nano /etc/supervisor/conf.d/fsnake.conf
```

and write the following lines:

```
[program:fsnake]
directory=*path to the folder containing the fsnake folder*/fsnake
command=*path to fsnake*/venv/bin/gunicorn -w 9 run:app
user=*your username*
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
stderr_logfile=/var/log/fsnake/fsnake.err.log
stdout_logfile=/var/log/fsnake/fsnake.out.log
```

and create the error log file and the standard output log file:
```
sudo mkdir -p /var/log/fsnake/
sudo touch /var/log/fsnake/fsnake.err.log
sudo touch /var/log/fsnake/fsnake.out.log
```
and finally :
```
sudo supervisorctl reload
```

if you get 403 errors (as i did) means that nginx doesn't have permissions to access the static files or the folders:
```
cd /fsnake/fsnake
chmod 755 */
cd fsnake/static
chmod 644 *
```
