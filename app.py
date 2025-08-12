from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from pymongo import MongoClient
from functools import wraps
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from io import BytesIO
import locale
import json
import os
import re

app = Flask(__name__)
app.secret_key = 'sjdcasjbcsabfh'

client = MongoClient('mongodb://localhost:27017/')

db = client['Database_Nou']
users_collection = db['users']
dataLapangan_collection = db['dataLapangan']
admins_collection = db['admin']
dataBooking_collection = db['booking']

###########################################################################################################

# kodingan untuk format rupiah
@app.template_filter('rupiah')
def rupiah_format(angka):
    return "{:,.0f}".format(angka).replace(",", ".")

@app.route('/get-session')
def get_session():
    email = session.get('email', '')
    user = users_collection.find({'email': email})[0]
    data_user = {
            'nama': user['nama'],
            'email': user['email'],
            'foto': user['foto'],
            'no_telp': user['no_telp']
        }
    return jsonify(data_user)

@app.route('/get-booking', methods=['GET', 'POST'])
def get_booking():
    email = session.get('email', '')
    bookings = dataBooking_collection.find({'email': email})
    data_booking = [
        {**booking, '_id': str(booking['_id'])}
        for booking in bookings
    ]
    return jsonify(list(data_booking))

@app.route('/get-lapangan')
def get_lapangan():
    kode = request.args.get('id')
    lapangan = dataLapangan_collection.find_one({'_id': ObjectId(kode)})
    lapangan['_id'] = str(lapangan['_id'])
    return jsonify(lapangan)
    
# Kodingan cek login user
def user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'nama' not in session:
            flash('Silakan login terlebih dahulu', 'error')
            return redirect(url_for('user_login'))
        return f(*args, **kwargs)
    return decorated_function

# Kodingan cek login admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_logged_in' not in session:
            flash('Silakan login terlebih dahulu', 'error')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

###########################################################################################################
@app.route('/profile', defaults={'page': 'Profile'})
@app.route('/profile/<page>')
@user_required
def profile(page):
    email = session.get('email', '')
    user = users_collection.find({'email': email})[0]
    data_user = {
            'kode': str(user['_id']),
            'nama': user['nama'],
            'email': user['email'],
            'foto': user['foto'],
            'no_telp': user['no_telp'],
            'alamat': user['alamat']
        }
    if page:
        return render_template('profile.html', page = page, profile=data_user)
    else:
        return render_template('profile.html')

@app.route('/profile/edit', methods=['GET', 'POST'])
@user_required
def edit_profile():
    if request.method == "POST":
        kode = request.form.get('kode')
        nama_pengguna = request.form.get('nama')
        email = request.form.get('email')
        no_telp = request.form.get('no_telp')
        alamat = request.form.get('alamat')
        password = request.form.get('password')

        foto = request.files.get('profileImage')

        # Validasi input kosong
        if not nama_pengguna or not email or not no_telp or not alamat or not foto:
            return jsonify({'status': 'error', 'message': 'Harap Melengkapi data!'}), 400
        
        # Cek format email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'status': 'error', 'message': 'Email tidak valid'}), 400

        # Cek apakah email telah digunakan
        current_user = users_collection.find_one({'_id': ObjectId(kode)})
        if current_user:
            # Jika email baru sama dengan email lama, lewati pengecekan
            if email == current_user['email']:
                pass  # Email tidak perlu diperiksa karena tidak berubah
            else:
                # Periksa apakah email sudah digunakan oleh pengguna lain
                existing_email = users_collection.find_one({'email': email})
                if existing_email:
                    return jsonify({'status': 'error', 'message': 'Email sudah digunakan!'}), 400
        
        if len(password) != 0 :
            # Cek panjang password
            if len(password) < 8:
                return jsonify({'status': 'error', 'message': 'Password harus minimal 8 karakter!'}), 400
            
            # Hash password
            hashed_password = generate_password_hash(password)
        
        if foto:
            # Tentukan jalur file yang akan dihapus
            file_path = os.path.join('static/dist/img/gambarPengguna', foto.filename)

            # Periksa apakah file lama ada sebelum dihapus
            if os.path.exists(file_path):
                os.remove(file_path)

            # Simpan file baru
            try:
                foto.save(file_path)
            except Exception as e:
                return jsonify({'status': 'error', 'message': 'Terjadi kesalahan saat menyimpan gambar: {e}'}), 400

        # Memasukkan data lapangan ke database
        try:
            if len(password) != 0:
                users_collection.update_one({'_id': ObjectId(kode)}, {'$set': {
                    'nama': nama_pengguna,
                    'email': email,
                    'no_telp': no_telp,
                    'alamat': alamat,
                    'foto': foto.filename,
                    'password': hashed_password
            }})
            else:
                users_collection.update_one({'_id': ObjectId(kode)}, {'$set': {
                    'nama': nama_pengguna,
                    'email': email,
                    'no_telp': no_telp,
                    'alamat': alamat,
                    'foto': foto.filename
            }})
            # users_collection.insert_one(new_user)
            return jsonify({'status': 'success', 'message': 'Data berhasil disimpan!'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    # Jika method GET, tampilkan form tambah lapangan
    return redirect(url_for('pengguna'))

# Kodingan Home
@app.route('/')
def home():
    lapangan = dataLapangan_collection.find().limit(8)
    return render_template('home.html', halaman= 'Beranda',  lapangan=lapangan)

# Kodingan User
@app.route('/register', methods=['GET', 'POST'])
def user_register():
    if request.method == 'POST':
        nama_lengkap = request.form['nama_lengkap']
        email = request.form['email']
        password = request.form['password']
        
        # Validasi input kosong
        if not nama_lengkap or not email or not password:
            print('haloo')
            flash('Semua kolom harus diisi!', 'error')
            return redirect('/register')
        
        # Cek format email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            flash('Email tidak valid', 'error')
            return redirect(url_for('register'))
        
        # Cek apakah email telah digunakan
        existing_email = users_collection.find_one({'email': email})
        if existing_email:
            flash('Email sudah digunakan!', 'error')
            return redirect('/register')
        
        # Cek panjang password
        if len(password) < 8:
            flash('Password harus minimal 8 karakter!', 'error')
            return redirect('/register')
        
        # Jika semua validasi berhasil, buat user baru
        hashed_password = generate_password_hash(password)
        
        # Simpan ke database
        new_user = {
            'nama': nama_lengkap,
            'email': email,
            'no_telp': '',
            'alamat': '',
            'foto': '',
            'password': hashed_password
        }
        
        try:
            users_collection.insert_one(new_user)
            flash('Registrasi berhasil! Silakan login.', 'success')
            return redirect('/login')
        except Exception as e:
            flash('Terjadi kesalahan. Silakan coba lagi.', 'error')
            return redirect('/register')
            
    # Jika method GET, tampilkan form register
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def user_login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = users_collection.find_one({'email': email})
        
        if user and check_password_hash(user['password'], password):
            session['nama'] = user.get('nama')
            session['email'] = user.get('email')
            flash('Login berhasil!', 'success')
            return redirect(url_for('home'))
        else:
            flash('email atau password salah!', 'error')
    return render_template('login.html')

@app.route('/logout')
def user_logout():
    session.clear()
    return redirect(url_for('home'))

###########################################################################################################

@app.route('/blog')
def blog():
    return render_template('blog.html', halaman= 'Blog')

@app.route('/tentang')
def tentang():
    return render_template('tentang.html', halaman= 'Tentang')

@app.route('/pembayaran', methods=['GET', 'POST'])
@user_required
def pembayaran():
    if request.method == 'POST':
        data = request.form.to_dict()
        
        booking_data = {
            "nama": data['nama'],
            "no_telp": data['no_telp'],
            "email": data['email'],
            "nama_lapangan": data['nama_lapangan'],
            "detail_lapangan": data['detail_lapangan'],
            "tanggal_pemesanan": datetime.today().strftime('%d-%m-%Y'),
            "tanggal": data['tanggal'],
            "jam": data['jam'],
            "harga_lapangan": data['harga_lapangan'],
            "harga_total": data['harga_total'], 
            "status": 'Belum Selesai'
        }

        dataBooking_collection.insert_one(booking_data)
        return jsonify({"message": "Data berhasil disimpan"}), 200
    return render_template('pembayaran.html')

###########################################################################################################

# kodingan lapangan

def buat_jam():

    """Generate time slots from 08:00 to 21:00"""
    slots = []
    start = datetime.strptime("08:00", "%H:%M")
    end = datetime.strptime("21:00", "%H:%M")
    current = start
    
    while current <= end:
        slots.append(current.strftime("%H:%M"))
        current += timedelta(hours=1)
    
    return slots

@app.route('/lapangan')
def daftar_lapangan():
    lapangan = dataLapangan_collection.find()
    return render_template('daftarLapangan.html', halaman= 'Sewa Lapangan', lapangan=lapangan)

@app.route('/detail_lapangan/<string:nama>')
def detail_lapangan(nama):
    lapangan = dataLapangan_collection.find_one({'nama': nama.replace("_", " ")})
    daftarLapangan = [item['namaLapangan'] for item in lapangan['lapangan']]
    return render_template('detailLapangan.html', halaman= 'Sewa Lapangan', lapangan=lapangan, daftarLapangan= daftarLapangan)

@app.route('/cek_ketersediaan_slot', methods=['POST'])
def cek_ketersediaan_slot():
    selected_date = request.form.get('tanggal')
    detail_lapangan = request.form.get('detail_lapangan')
    nama_lapangan = request.form.get('nama_lapangan')

    # mencari berdasarkan database
    existing_bookings = dataBooking_collection.find({
        'nama_lapangan': nama_lapangan,
        'detail_lapangan': detail_lapangan,
        'tanggal': selected_date
    })

    # mengubah hasil pencarian dan menangani multiple jam dalam satu booking
    booked_times = set()
    for booking in existing_bookings:
        # Split jam if it contains multiple times
        jam_slots = [time.strip() for time in booking['jam'].split(',')]
        booked_times.update(jam_slots)

    # mengambil harga dari database
    data_lapangan = dataLapangan_collection.find_one({
        'nama': nama_lapangan
    }) 
    harga = next((lapangan['harga'] for lapangan in data_lapangan['lapangan'] if lapangan['namaLapangan'] == detail_lapangan), None)

    # membuat keseluruhan jam
    all_slots = buat_jam()
    
    # mengecek ketersediaan jam
    availability_data = []
    
    for slot in all_slots:
        is_disabled = (slot in booked_times)
        
        availability_data.append({
            'lapangan': nama_lapangan,
            'lapanganDetail': detail_lapangan,
            'harga': harga,
            'tanggal': selected_date,
            'jam': slot,
            'is_booked': is_disabled
        })
    
    return jsonify(availability_data)

@app.route('/cari_lapangan', methods=['POST'])
def cari_lapangan():
    query = request.form.get('query', '').strip()
    
    if not query:
        hasil = list(dataLapangan_collection.find().limit(20))
    else:
        hasil = list(dataLapangan_collection.find({
            '$or': [
                {'nama': {'$regex': query, '$options': 'i'}},
                {'lokasi': {'$regex': query, '$options': 'i'}}
            ]
        }).limit(20))
    
    # Ubah ObjectId menjadi string
    for item in hasil:
        item['_id'] = str(item['_id'])
    
    return jsonify(hasil)

###########################################################################################################

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = admins_collection.find_one({'username': username})
        
        if admin and check_password_hash(user['password'], password):
            session['admin_logged_in'] = True
            flash('Login berhasil!', 'success')
            return redirect(url_for('admin'))
        else:
            flash('Username atau password salah!', 'error')    
    return render_template('admin/login.html')

@app.route('/admin/logout')
def admin_logout():
    session.clear()
    return redirect(url_for('home'))

@app.route('/admin')
@admin_required
def admin():
    jumlah_booking = dataBooking_collection.count_documents({"status": "Selesai"})
    jumlah_pengguna = users_collection.count_documents({})
    pipeline = [
                    {"$match": {"status": "Selesai"}},  # Filter untuk status "Selesai"
                    {"$addFields": {"harga_total": {"$toDouble": "$harga_total"}}},  # Mengonversi harga_total ke angka
                    {"$group": {"_id": None, "total_harga": {"$sum": "$harga_total"}}}  # Menghitung jumlah harga_total
                ]
    result = dataBooking_collection.aggregate(pipeline)
    # Ambil hasilnya
    total_pendapatan = 0
    for item in result:
        total_pendapatan = item["total_harga"]

    locale.setlocale(locale.LC_ALL, 'id_ID.UTF-8')
    total_pendapatan_rp = locale.currency(total_pendapatan, grouping=True)

    return render_template('admin/home.html', halaman="Dashboard", jumlah_booking=jumlah_booking, total_pendapatan=total_pendapatan_rp, jumlah_pengguna=jumlah_pengguna)
    
###########################################################################################################

# kodingan admin lapangan

@app.route('/admin/lapangan')
@admin_required
def lapangan():
    lapangan = dataLapangan_collection.find()
    return render_template('admin/lapangan.html', halaman="Lapangan", lapangan=lapangan)

@app.route('/admin/lapangan/tambah', methods=['GET', 'POST'])
@admin_required
def tambah_lapangan():
    if request.method == "POST":
        nama = request.form.get('nama')
        lokasi = request.form.get('lokasi')
        kontak = request.form.get('kontak')

        data_lapangan = request.form.get('courts')

        banner = request.files.get('profileImageLapangan')
        
        # Validasi input kosong
        if not nama or not lokasi or not kontak or not banner or not data_lapangan:
            return jsonify({'status': 'error', 'message': 'Harap melengkapi data!'}), 400
        
        # Menyimpan gambar banner
        if banner:
            banner.save(os.path.join('static/dist/img/gambarLapangan', banner.filename))
        else:
            return jsonify({'status': 'error', 'message': 'Gagal menyimpan gambar!'}), 400

        try:
            lapangan = json.loads(data_lapangan)
        except json.JSONDecodeError:
            return jsonify({'status': 'error', 'message': 'Format data lapangan tidak valid!'}), 400

        # Menyiapkan data lapangan untuk dimasukkan
        new_lapangan = {
            'nama': nama,
            'lokasi': lokasi,
            'kontak': kontak,
            'banner': banner.filename,
            'lapangan': lapangan
        }

        # Memasukkan data lapangan ke database
        try:
            dataLapangan_collection.insert_one(new_lapangan)
            return jsonify({'status': 'success', 'message': 'Data berhasil disimpan!'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
        
    # Jika method GET, tampilkan form tambah lapangan
    return redirect(url_for('tambah_lapangan'))

@app.route('/admin/lapangan/edit', methods=['GET', 'POST'])
@admin_required
def edit_lapangan():
    if request.method == "POST":
        kode = request.form.get('id')
        nama = request.form.get('nama')
        lokasi = request.form.get('lokasi')
        kontak = request.form.get('kontak')

        data_lapangan = request.form.get('courts')

        banner = request.files.get('profileImageLapangan')
        
        # Validasi input kosong
        if not nama or not lokasi or not kontak or not data_lapangan:
            return jsonify({'status': 'error', 'message': 'Harap melengkapi data!'}), 400
        
        # Menyimpan gambar banner
        if banner:
            lapangan = dataLapangan_collection.find_one({'_id': ObjectId(kode)})
            print(lapangan["banner"])
            file_path = f'./static/dist/img/gambarLapangan/{lapangan["banner"]}'
            if os.path.exists(file_path):
                os.remove(file_path)

            nama_file_asli = banner.filename
            nama_file_foto = secure_filename(nama_file_asli)
            file_path = f'./static/dist/img/gambarLapangan/{nama_file_foto}'
            banner.save(file_path)        

        try:
            lapangan = json.loads(data_lapangan)
        except json.JSONDecodeError:
            return jsonify({'status': 'error', 'message': 'Format data lapangan tidak valid!'}), 400

        # Memasukkan data lapangan ke database
        try:
            if banner:
                dataLapangan_collection.update_one({'_id': ObjectId(kode)}, {'$set': {
                    'nama': nama,
                    'lokasi': lokasi,
                    'kontak': kontak,
                    'banner': banner.filename,
                    'lapangan': lapangan
                }})
            else:
                dataLapangan_collection.update_one({'_id': ObjectId(kode)}, {'$set': {
                    'nama': nama,
                    'lokasi': lokasi,
                    'kontak': kontak,
                    'lapangan': lapangan
                }})
            return jsonify({'status': 'success', 'message': 'Data berhasil diedit!'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
        
    # Jika method GET, tampilkan form tambah lapangan
    return redirect(url_for('lapangan'))

@app.route('/admin/lapangan/hapus', methods=['GET', 'POST'])
@admin_required
def hapus_lapangan():
    lapangan_id = request.form['id']
    lapangan = dataLapangan_collection.find_one({'_id': ObjectId(lapangan_id)})
    file_path = f'./static/dist/img/gambarLapangan/{lapangan["banner"]}'
    if os.path.exists(file_path):
        os.remove(file_path)

    dataLapangan_collection.delete_one({'_id': ObjectId(lapangan_id)})
    return redirect(url_for('lapangan'))

###########################################################################################################

# kodingan admin pengguna

@app.route('/admin/pengguna')
@admin_required
def pengguna():
    dataPengguna = users_collection.find()
    return render_template('admin/pengguna.html', halaman="Pengguna", pengguna=dataPengguna)

@app.route('/admin/pengguna/tambah', methods=['GET', 'POST'])
@admin_required
def tambah_pengguna():
    if request.method == "POST":
        nama_pengguna = request.form.get('nama')
        email = request.form.get('email')
        no_telp = request.form.get('no_telp')
        alamat = request.form.get('alamat')
        password = request.form.get('password')

        foto = request.files.get('profileImage')

        # Validasi input kosong
        if not nama_pengguna or not email or not no_telp or not alamat or not foto or not password:
            return jsonify({'status': 'error', 'message': 'Harap Melengkapi data!'}), 400
        
        # Cek format email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return jsonify({'status': 'error', 'message': 'Email tidak valid'}), 400

        # Cek apakah email telah digunakan
        existing_email = users_collection.find_one({'email': email})
        if existing_email:
            return jsonify({'status': 'error', 'message': 'Email sudah digunakan!'}), 400
        
        # Cek panjang password
        if len(password) < 8:
            return jsonify({'status': 'error', 'message': 'Password harus minimal 8 karakter!'}), 400

        # Menyimpan gambar banner
        if foto:
            foto.save(os.path.join('static/dist/img/gambarPengguna', foto.filename))

        # Hash password
        hashed_password = generate_password_hash(password)

        # Menyiapkan data pengguna untuk dimasukkan
        new_user = {
            'nama': nama_pengguna,
            'email': email,
            'no_telp': no_telp,
            'alamat': alamat,
            'foto': foto.filename,
            'password': hashed_password
        }

        # Memasukkan data lapangan ke database
        try:
            users_collection.insert_one(new_user)
            return jsonify({'status': 'success', 'message': 'Data berhasil disimpan!'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 400
    # Jika method GET, tampilkan form tambah lapangan
    return redirect(url_for('pengguna'))

@app.route('/admin/pengguna/edit/<pengguna_id>')
@admin_required
def edit_pengguna(pengguna_id):
    if request.method == 'POST':
        nama_pengguna = request.form['nama_pengguna']
        email = request.form['email']
        no_telp = request.form['no_telp']
        alamat = request.form['alamat']
        foto = request.form['foto']
        password= request.form['password']

        # Validasi format ObjectId
        if not ObjectId.is_valid(pengguna_id):
            flash('Format ID tidak valid', 'error')
            return redirect(url_for('tambah_lapangan'))


        # Validasi input kosong
        if not nama_pengguna or not email or not no_telp or not alamat or not foto or not password:
            flash('Harap Melengkapi data!', 'error')
            return redirect(url_for('tambah_lapangan'))
        
        # Cek format email
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            flash('Email tidak valid', 'error')
            return redirect(url_for('pengguna'))

        # Cek apakah email telah digunakan
        existing_email = users_collection.find_one({'email': email})
        if existing_email:
            flash('Email sudah digunakan!', 'error')
            return redirect('/pengguna')
        
        # Cek panjang password
        if len(password) < 8:
            flash('Password harus minimal 8 karakter!', 'error')
            return redirect('/pengguna')

        # Hash password
        hashed_password = generate_password_hash(password)

        # Edit banner
        if foto:
            lapangan = users_collection.find_one({'_id': ObjectId(pengguna_id)})
            file_path = f'./static/dist/img/gambarPengguna/{lapangan["foto"]}'
            if os.path.exists(file_path):
                os.remove(file_path)

            nama_file_asli = foto.filename
            nama_file_foto = secure_filename(nama_file_asli)
            file_path = f'./static/dist/img/gambarPengguna/{nama_file_foto}'
            foto.save(file_path)
            
            # Mengedit data lapangan di database dengan mengubah banner
            try:
                users_collection.update_one({'_id': ObjectId(pengguna_id)}, {'$set': {
                    'nama': nama_pengguna,
                    'email': email,
                    'no_telp': no_telp,
                    'alamat': alamat,
                    'foto': nama_file_foto,
                    'password': hashed_password
                }})
                return redirect(url_for('tambah_lapangan'))
            except Exception as e:
                flash('Data gagal ditambahkan. Silakan coba lagi.', 'error')
                return redirect(url_for('tambah_lapangan'))
            
        else:
            # Mengedit data lapangan di database tanpa mengubah banner
            try:
                users_collection.update_one({'_id': ObjectId(pengguna_id)}, {'$set': {
                    'nama': nama_pengguna,
                    'email': email,
                    'no_telp': no_telp,
                    'alamat': alamat,
                    'foto': nama_file_foto,
                    'password': hashed_password
                }})
                return redirect(url_for('tambah_lapangan'))
            except Exception as e:
                flash('Data gagal ditambahkan. Silakan coba lagi.', 'error')
                return redirect(url_for('pengguna'))
    return redirect(url_for("pengguna"))

@app.route('/admin/pengguna/hapus', methods=['GET', 'POST'])
@admin_required
def hapus_pengguna():
    pengguna_id = request.form['id']
    pengguna = users_collection.find_one({'_id': ObjectId(pengguna_id)})

    file_path = f'./static/dist/img/gambarPengguna/{pengguna["foto"]}'
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            flash(f"Terjadi kesalahan saat menghapus file: {str(e)}", "error")

    users_collection.delete_one({'_id': ObjectId(pengguna_id)})
    return redirect(url_for('pengguna'))

###########################################################################################################

# kodingan admin transaksi

@app.route('/admin/pemesanan', methods=['GET', 'POST'])
@admin_required
def pemesanan():
    if request.method == 'POST':
        booking_id = request.form['id']
        dataBooking_collection.update_one({'_id': ObjectId(booking_id)}, {'$set': {
                    'status': 'Selesai'
                }})
        return redirect(url_for('pemesanan'))
    dataPemesanan = dataBooking_collection.find({"status": "Belum Selesai"})
    return render_template('admin/pemesanan.html', halaman="Pemesanan", pemesanan=dataPemesanan)        

@app.route('/admin/riwayat')
@admin_required
def riwayat():
    dataRiwayat = dataBooking_collection.find({"status": "Selesai"})
    return render_template('admin/riwayat.html', halaman="Riwayat", riwayat=dataRiwayat)

def proses_laporan(pemesanan_data):

    # Inisialisasi buffer dan dokumen
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(letter),
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )
    
    # Inisialisasi styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        alignment=TA_CENTER,
        spaceAfter=30
    )
    
    # Membuat elements untuk dokumen
    elements = []
    
    # Menambahkan judul
    title = Paragraph("Laporan Pemesanan Lapangan", title_style)
    elements.append(title)
    elements.append(Spacer(1, 20))
    
    # Membuat header untuk tabel
    table_headers = [
        "Nama Pelanggan",
        "Nama Lapangan",
        "Detail",
        "Tanggal Pesan",
        "Tanggal Main",
        "Jam",
        "Harga",
        "Total"
    ]
    
    # Menyiapkan data untuk tabel
    table_data = [table_headers]
    
    # Jika pemesanan_data adalah dictionary tunggal, konversi ke list
    if isinstance(pemesanan_data, dict):
        pemesanan_data = [pemesanan_data]
    
    # Mengisi data tabel
    for pemesanan in pemesanan_data:
        row = [
            pemesanan.get("nama", ""),
            pemesanan.get("nama_lapangan", ""),
            pemesanan.get("detail_lapangan", ""),
            pemesanan.get("tanggal_pemesanan", ""),
            pemesanan.get("tanggal", ""),
            pemesanan.get("jam", ""),
            f"Rp {int(pemesanan.get('harga_lapangan', 0)):,}",
            f"Rp {int(pemesanan.get('harga_total', 0)):,}"
        ]
        table_data.append(row)
    
    # Membuat tabel
    table = Table(table_data, repeatRows=1)
    
    # Style untuk tabel
    table_style = TableStyle([
        # Header style
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C3E50')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        
        # Data rows
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
        ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 1), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('LINEBEFORE', (0, 0), (-1, -1), 1, colors.black),
        ('LINEAFTER', (0, 0), (-1, -1), 1, colors.black),
        ('LINEBELOW', (0, 0), (-1, -1), 1, colors.black),
        ('LINEABOVE', (0, 0), (-1, -1), 1, colors.black),
        
        # Additional formatting
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('WORDWRAP', (0, 0), (-1, -1), True),
    ])
    
    table.setStyle(table_style)
    
    # Mengatur lebar kolom
    table._argW[0] = doc.width/8  # Nama
    table._argW[1] = doc.width/8  # Nama Lapangan
    table._argW[2] = doc.width/8  # Detail
    table._argW[3] = doc.width/8  # Tanggal Pesan
    table._argW[4] = doc.width/8  # Tanggal Main
    table._argW[5] = doc.width/8  # Jam
    table._argW[6] = doc.width/8  # Harga
    table._argW[7] = doc.width/8  # Total
    
    elements.append(table)
    
    # Build dokumen
    doc.build(elements)
    
    # Get PDF content
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return pdf_content

@app.route('/buatLaporanPemesanan', methods=['GET'])
def buat_laporan():
    try:
        pdf_content = proses_laporan(list(dataBooking_collection.find({"status": "Selesai"})))
        response = make_response(pdf_content)
        response.headers['Content-Disposition'] = 'attachment; filename=laporan_pemesanan.pdf'
        response.headers['Content-Type'] = 'application/pdf'
        return response
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True) 