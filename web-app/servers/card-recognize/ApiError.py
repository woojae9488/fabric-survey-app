class ApiError(Exception):
    def __init__(self, status, error):
        self.status = status
        self.error = error

    def __str__(self):
        return str(self.status) + ': ' + self.error


class QRcodeReadError(ApiError):
    def __init__(self):
        super().__init__(401, 'Failed to recognize QRcode')


class StudentCardReadError(ApiError):
    def __init__(self):
        super().__init__(400, 'Failed to recognize Student Card')


class ImageTypeUnmatchError(ApiError):
    def __init__(self):
        super().__init__(400, 'Only base64 type image can recongnize')
