package com.easydraw.utils;

import java.util.HashMap;
import java.util.Map;

public class ResponseUtils {

    /**
     * 构建成功响应
     * @param data 响应数据
     * @return 响应Map
     */
    public static Map<String, Object> buildSuccessResponse(Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("status", "success");
        return response;
    }

    /**
     * 构建错误响应
     * @param message 错误消息
     * @return 响应Map
     */
    public static Map<String, Object> buildErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", null);
        response.put("status", "error");
        response.put("message", message);
        return response;
    }

}
