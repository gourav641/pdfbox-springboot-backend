// Base URL for your Spring Boot application
const BASE_URL = 'https://docuflow-pdf-operation-app.onrender.com; // Change this to your server URL

// Utility function to show status messages
function showStatus(elementId, message, type) {
    const statusElement = document.getElementById(elementId);
    statusElement.style.display = 'block';
    statusElement.className = `status-message status-${type}`;
    statusElement.textContent = message;
}

// Utility function to hide status messages
function hideStatus(elementId) {
    const statusElement = document.getElementById(elementId);
    statusElement.style.display = 'none';
}

// Utility function to download file
function downloadFile(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Function to display selected files
function displayFileList(files, listElementId, removeCallback) {
    const listElement = document.getElementById(listElementId);
    if (files.length === 0) {
        listElement.style.display = 'none';
        return;
    }

    listElement.style.display = 'block';
    listElement.innerHTML = '<strong>Selected Files:</strong>';

    Array.from(files).forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span>${file.name} (${(file.size / 1024).toFixed(2)} KB)</span>
            <button type="button" class="remove-file-btn" data-index="${index}">Remove</button>
        `;
        listElement.appendChild(fileItem);
    });

    // Add event listeners to remove buttons
    if (removeCallback) {
        listElement.querySelectorAll('.remove-file-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                removeCallback(parseInt(this.dataset.index));
            });
        });
    }
}

// ===== CREATE PDF =====
if (document.getElementById('createForm')) {
    const createForm = document.getElementById('createForm');
    const createFiles = document.getElementById('createFiles');
    let selectedFiles = [];

    createFiles.addEventListener('change', function() {
        selectedFiles = Array.from(this.files);
        displayFileList(selectedFiles, 'createFileList', (index) => {
            selectedFiles.splice(index, 1);
            displayFileList(selectedFiles, 'createFileList', arguments.callee);
        });
    });

    createForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (selectedFiles.length === 0) {
            showStatus('createStatus', 'Please select at least one file', 'error');
            return;
        }

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            showStatus('createStatus', 'Creating PDF... Please wait', 'loading');

            const response = await fetch(`${BASE_URL}/upload/create`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const blob = await response.blob();
            downloadFile(blob, 'created.pdf');
            showStatus('createStatus', 'PDF created successfully!', 'success');

            // Reset form
            createForm.reset();
            selectedFiles = [];
            displayFileList([], 'createFileList');

        } catch (error) {
            showStatus('createStatus', `Error: ${error.message}`, 'error');
        }
    });
}

// ===== COMPRESS PDF =====
if (document.getElementById('compressForm')) {
    const compressForm = document.getElementById('compressForm');
    const compressFile = document.getElementById('compressFile');

    compressFile.addEventListener('change', function() {
        displayFileList(this.files, 'compressFileList');
    });

    compressForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!compressFile.files[0]) {
            showStatus('compressStatus', 'Please select a PDF file', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', compressFile.files[0]);

        try {
            showStatus('compressStatus', 'Compressing PDF... Please wait', 'loading');

            const response = await fetch(`${BASE_URL}/upload/compress`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const blob = await response.blob();
            downloadFile(blob, 'compressed.pdf');
            showStatus('compressStatus', 'PDF compressed successfully!', 'success');

            // Reset form
            compressForm.reset();
            displayFileList([], 'compressFileList');

        } catch (error) {
            showStatus('compressStatus', `Error: ${error.message}`, 'error');
        }
    });
}

// ===== MERGE PDFs =====
if (document.getElementById('mergeForm')) {
    const mergeForm = document.getElementById('mergeForm');
    const mergeFiles = document.getElementById('mergeFiles');
    let selectedMergeFiles = [];

    mergeFiles.addEventListener('change', function() {
        selectedMergeFiles = Array.from(this.files);
        displayFileList(selectedMergeFiles, 'mergeFileList', (index) => {
            selectedMergeFiles.splice(index, 1);
            displayFileList(selectedMergeFiles, 'mergeFileList', arguments.callee);
        });
    });

    mergeForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (selectedMergeFiles.length < 2) {
            showStatus('mergeStatus', 'Please select at least 2 PDF files', 'error');
            return;
        }

        const formData = new FormData();
        selectedMergeFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            showStatus('mergeStatus', 'Merging PDFs... Please wait', 'loading');

            const response = await fetch(`${BASE_URL}/upload/merge`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
            console.log("Error in above block")
                throw new Error(`Server error: ${response.status}`);
            }

            const blob = await response.blob();
            downloadFile(blob, 'merged.pdf');
            showStatus('mergeStatus', 'PDFs merged successfully!', 'success');

            // Reset form
            mergeForm.reset();
            selectedMergeFiles = [];
            displayFileList([], 'mergeFileList');

        } catch (error) {
            showStatus('mergeStatus', `Error: ${error.message}`, 'error');
        }
    });
}

// ===== REMOVE PAGES =====
if (document.getElementById('removeForm')) {
    const removeForm = document.getElementById('removeForm');
    const removeFile = document.getElementById('removeFile');
    const pageNumbers = document.getElementById('pageNumbers');

    removeFile.addEventListener('change', function() {
        displayFileList(this.files, 'removeFileList');
    });

    removeForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!removeFile.files[0]) {
            showStatus('removeStatus', 'Please select a PDF file', 'error');
            return;
        }

        if (!pageNumbers.value.trim()) {
            showStatus('removeStatus', 'Please enter page numbers', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', removeFile.files[0]);
        formData.append('pageNumbers', pageNumbers.value.trim());

        try {
            showStatus('removeStatus', 'Removing pages... Please wait', 'loading');

            const response = await fetch(`${BASE_URL}/upload/remove`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const blob = await response.blob();
            downloadFile(blob, 'modified.pdf');
            showStatus('removeStatus', 'Pages removed successfully!', 'success');

            // Reset form
            removeForm.reset();
            displayFileList([], 'removeFileList');

        } catch (error) {
            showStatus('removeStatus', `Error: ${error.message}`, 'error');
        }
    });
}

// ===== LOCK PDF =====
if (document.getElementById('lockForm')) {
    const lockForm = document.getElementById('lockForm');
    const lockFile = document.getElementById('lockFile');
    const ownerPassword = document.getElementById('ownerPassword');
    const userPassword = document.getElementById('userPassword');
    const allowContentExtraction = document.getElementById('allowContentExtraction');
    const allowPrinting = document.getElementById('allowPrinting');

    lockFile.addEventListener('change', function() {
        displayFileList(this.files, 'lockFileList');
    });

    lockForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!lockFile.files[0]) {
            showStatus('lockStatus', 'Please select a PDF file', 'error');
            return;
        }

        if (!ownerPassword.value || !userPassword.value) {
            showStatus('lockStatus', 'Please enter both passwords', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', lockFile.files[0]);
        formData.append('ownerPassword', ownerPassword.value);
        formData.append('userPassword', userPassword.value);
        formData.append('allowContentExtraction', allowContentExtraction.checked);
        formData.append('allowPrinting', allowPrinting.checked);

        try {
            showStatus('lockStatus', 'Locking PDF... Please wait', 'loading');

            const response = await fetch(`${BASE_URL}/upload/protect`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const blob = await response.blob();
            downloadFile(blob, 'protected.pdf');
            showStatus('lockStatus', 'PDF locked successfully!', 'success');

            // Reset form
            lockForm.reset();
            displayFileList([], 'lockFileList');
            allowPrinting.checked = true; // Reset to default

        } catch (error) {
            showStatus('lockStatus', `Error: ${error.message}`, 'error');
        }
    });
}

// Add drag and drop support for all file inputs
document.querySelectorAll('.file-input-label').forEach(label => {
    const input = label.parentElement.querySelector('.file-input');

    label.addEventListener('dragover', (e) => {
        e.preventDefault();
        label.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        label.style.color = 'white';
    });

    label.addEventListener('dragleave', () => {
        label.style.background = '';
        label.style.color = '';
    });

    label.addEventListener('drop', (e) => {
        e.preventDefault();
        label.style.background = '';
        label.style.color = '';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            input.files = files;
            input.dispatchEvent(new Event('change'));
        }
    });
});
