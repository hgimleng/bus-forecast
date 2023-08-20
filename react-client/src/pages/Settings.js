function Settings({ active }) {
    return (
        <div className={`container mt-4 mb-4 text-center ${active ? '' : 'd-none'}`}>
            <h1>Settings</h1>
        </div>
    )
}

export default Settings;