document.addEventListener("DOMContentLoaded", () => {
    function isFestivalTime() {
        const now = new Date();
        const year = now.getFullYear();
        const startDate = new Date(year, 10, 27);
        const endDate = new Date(year, 11, 7);
        return now >= startDate && now <= endDate;
    }

    function disablePage(errorCode = 0) {
        if (!isFestivalTime()) {
            console.log("Festival has not yet started.");
            clerkInput.readOnly = false;
            return;
        }

        form.style.display = 'none';

        if (errorCode === 1) {
            error = '資料驗證錯誤';
        }
        else if (errorCode === 2) {
            error = '連線逾時';
        }
        else {
            error = '安全模式已開啟';
        }

        const errorHeader = document.createElement('h1');
        errorHeader.innerHTML = `${error}，請重新掃描英語週工人<span class="hanLatin" style="padding-right: 0">QR Code</span>。`;
        errorHeader.style.alignSelf = 'center';
        errorHeader.style.textAlign = 'center';
        errorHeader.style.flex = 1;
        const errorDiv = document.getElementsByClassName('blurred-bg')[0];
        errorDiv.style.display = 'flex';
        errorDiv.appendChild(errorHeader);
    }
});