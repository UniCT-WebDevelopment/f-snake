from flask import render_template, redirect, url_for, request, session, jsonify, make_response
from fsnake import app, db, bcrypt
from fsnake.models import User, Score
from flask_login import login_user, current_user, logout_user, login_required

app.config['SECRET_KEY'] = '@WfJJ-F7fwSpxgFL7#Ee'

@app.route("/")
def home():
    if current_user.is_authenticated:
        return render_template('index.html', name = current_user.username)
    else :
        return render_template('index.html', name='Guest')

@app.route("/AI.html")
def ai():
    return render_template('AI.html', name='AI is playing')

@app.route("/vsAI.html")
def vsai():
    if current_user.is_authenticated:
        return render_template('vsAI.html', name = current_user.username)
    else :
        return render_template('vsAI.html', name='Guest')

@app.route("/leaderboard.html")
def leaderboard():
    scoresAI = Score.query.filter_by(Type = 'AI').order_by(Score.score.desc()).limit(15).all()
    scoresSingle = Score.query.filter_by(Type = 'singlePlayer').order_by(Score.score.desc()).limit(15).all()
    scoresVsAI = Score.query.filter_by(Type = 'vsAI').order_by(Score.score.desc()).limit(15).all()
    
    if current_user.is_authenticated:
        return render_template('leaderboard.html', name = current_user.username, x=scoresSingle, y=scoresVsAI, z=scoresAI)
    else :
        return render_template('leaderboard.html', name='Guest', x=scoresSingle, y=scoresVsAI, z=scoresAI)

@app.route("/registration", methods=["POST"])
def registration():
    req = request.get_json(force = True)
    username = request.json['username']
    password = bcrypt.generate_password_hash(request.json['password']).decode('utf-8')

    tuser = User.query.filter_by(username = username).first()
    if tuser:
        res = make_response(jsonify({"response" : "username already taken"}), 400)
    else:
        user = User(username=username, password=password)
        db.session.add(user)
        db.session.commit()
        if request.json['type'] == 'single' :
            score = Score(score=request.json['score'], Type='singlePlayer', user_id=user.id)
            db.session.add(score)
            db.session.commit()
        else:
            score = Score(score=request.json['score'], Type='vsAI', user_id=user.id)
            db.session.add(score)
            db.session.commit()
        login_user(user, False)
        res = make_response(jsonify({"response" : "Success"}), 200)
    return res

@app.route("/login", methods=["POST"])
def login():
    req = request.get_json(force = True)
    username = request.json['username']

    tuser = User.query.filter_by(username = username).first()

    if tuser:
        if bcrypt.check_password_hash(tuser.password, request.json['password']):
            login_user(tuser, False)
            if request.json['type'] == 'single' :
                score = Score(score=request.json['score'], Type='singlePlayer', user_id=tuser.id)
                db.session.add(score)
                db.session.commit()
            else:
                score = Score(score=request.json['score'], Type='vsAI', user_id=tuser.id)
                db.session.add(score)
                db.session.commit()
                res = make_response(jsonify({"message" : "Success"}), 200)
        else:
            res = make_response(jsonify({"message" : "wrong password"}), 400)
    else:
        res = make_response(jsonify({"message" : "username doesn't exist"}), 400)
    return res

@app.route("/saveuser", methods=["POST"])
def saveuser():
    username = request.json['username']
    tuser = User.query.filter_by(username = username).first()

    if tuser:
        if request.json['type'] == 'single' :
            score = Score(score=request.json['score'], Type='singlePlayer', user_id=tuser.id)
            db.session.add(score)
            db.session.commit()
            res = make_response(jsonify({"message" : "Success"}), 200)
        else:
            score = Score(score=request.json['score'], Type='vsAI', user_id=tuser.id)
            db.session.add(score)
            db.session.commit()
            res = make_response(jsonify({"message" : "Success"}), 200)
    else:
        res = make_response(jsonify({"message" : "Error"}), 400)
    return res

@app.route("/savescore", methods=["POST"])
def savescore():
    if request.method == "POST":
        tuser = User.query.filter_by(username = current_user.username).first()
        if tuser:
            if request.json['type'] == 'single' :
                score = Score(score=request.json['score'], Type='singlePlayer', user_id=tuser.id)
                db.session.add(score)
                db.session.commit()
                res = make_response(jsonify({"message" : "Success"}), 200)
            else:
                score = Score(score=request.json['score'], Type='vsAI', user_id=tuser.id)
                db.session.add(score)
                db.session.commit()
                res = make_response(jsonify({"message" : "Success"}), 200)
        else :
            res = make_response(jsonify({"message" : "Error"}), 400)
        return res

@app.route("/savescoreAI", methods=["POST"])
def savescoreAI():
    usr = User.query.filter_by(username = 'AI').first()
    if request.method == "POST":
        score = Score(score=request.json['score'], Type='AI', user_id=usr.id)
        db.session.add(score)
        db.session.commit()
        return make_response(jsonify({"message" : "Success"}), 200)

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for('home'))