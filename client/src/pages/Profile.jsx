import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart, updateUserFailure,
  updateUserSuccess, deleteUserFailure,
  deleteUserStart, deleteUserSuccess, signOutStart, signOutFailure, signOutSuccess
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';


export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [fileProgress, setFileProgress] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingError, setShowListingError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showDeleteListingError, setShowDeleteListingError] = useState(false);
  const dispatch = useDispatch();


  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFileProgress(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutFailure(data.message));
        return;
      }
      dispatch(signOutSuccess(data));
    } catch (error) {
      dispatch(signOutFailure(error.message));
    }
  }

  const handleShowListings = async () => {
    try {
      setShowListingError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      setShowDeleteListingError(false);
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        setShowDeleteListingError(true);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      setShowDeleteListingError(true);
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-4xl font-semibold text-center my-7'>Profile</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef} hidden
          accept='image/*' />

        <img onClick={() => fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt="profile" className='rounded-full h-24 w-24 self-center object-cover cursor-pointer mt-2' />

        <p className='text-sm self-center'>
          {fileUploadError ? (<span className='text-red-700'>Error uploading Image (Image must be less than 2 mb) </span>) :
            fileProgress > 0 && fileProgress < 100 ? <span className='text-slate-700'>{`Uploading ${fileProgress}%`}</span> :
              fileProgress === 100 ? <span className='text-green-700'>Image uploaded successfully</span>
                : ""
          }
        </p>

        <input type='text' defaultValue={currentUser.username} placeholder='username' className='border rounded-lg p-3 ' id='username'
          onChange={handleChange} />

        <input type='email' defaultValue={currentUser.email} placeholder='email' className='border rounded-lg p-3 ' id='email'
          onChange={handleChange} />

        <input type='password' placeholder='password' className='border rounded-lg p-3 ' id='password'
          onChange={handleChange} />

        <button disabled={loading} className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-90 disabled:opacity-75'>{loading ? 'Loading...' : 'Update'}</button>

        <Link className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-90' to={"/create-listing"}>Create Listing</Link>

      </form>

      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete Account</span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>

      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>{updateSuccess ? 'User updated successfully' : ''}</p>
      <button className=' text-green-700 w-full' onClick={handleShowListings}>Show Listings</button>
      <p className='text-red-700 mt-5'> {showListingError ? 'Error showing listing, please signIn again' : ''} </p>
      {
        userListings && userListings.length > 0 &&
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'> Your Listings</h1>
          {userListings.map((listing) => (
            <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
              <Link to={`/listing/${listing._id}`}>
                <img src={listing.imageUrls[0]} alt='listing cover' className='h-16 w-16 object-contain' />
              </Link>
              <Link className='text-slate-700 flex-1 hover:underline font-semibold truncate' to={`/listing/${listing._id}`}>
                <p >{listing.name}</p>
              </Link>

              <div className='flex flex-col items-center'>
                <button onClick={() => handleListingDelete(listing._id)} className='text-red-700 uppercase'>Delete</button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )
}
