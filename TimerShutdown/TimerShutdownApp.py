#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
定时开关机软件
Timer Shutdown Application
支持定时关机、重启、注销等功能
"""

import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
import datetime
import subprocess
import sys
import os
import json
from pathlib import Path

class TimerShutdownApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🕐 定时开关机软件 v1.0")
        self.root.geometry("500x600")
        self.root.resizable(False, False)
        
        # 配置文件路径
        self.config_file = Path("timer_config.json")
        
        # 定时器线程
        self.timer_thread = None
        self.is_running = False
        
        # 默认配置
        self.config = {
            "daily_restart_enabled": True,
            "restart_time": "08:00",
            "shutdown_delay": 30,
            "show_warning": True
        }
        
        # 先加载基础配置（不记录日志）
        self.load_config()

        # 创建界面
        self.create_widgets()

        # 界面创建完成后重新加载配置（记录日志）
        self.load_config()

        # 启动定时器（在界面创建完成后）
        self.root.after(1000, self.start_timer)
        
    def create_widgets(self):
        """创建界面组件"""
        # 主标题
        title_frame = tk.Frame(self.root, bg="#2196F3", height=60)
        title_frame.pack(fill="x", padx=0, pady=0)
        title_frame.pack_propagate(False)
        
        title_label = tk.Label(title_frame, text="🕐 定时开关机软件", 
                              font=("Arial", 16, "bold"), 
                              fg="white", bg="#2196F3")
        title_label.pack(expand=True)
        
        # 主容器
        main_frame = tk.Frame(self.root, padx=20, pady=20)
        main_frame.pack(fill="both", expand=True)
        
        # 每日重启设置
        restart_frame = tk.LabelFrame(main_frame, text="📅 每日定时重启", 
                                     font=("Arial", 12, "bold"), padx=10, pady=10)
        restart_frame.pack(fill="x", pady=(0, 20))
        
        # 启用每日重启
        self.restart_enabled = tk.BooleanVar(value=self.config["daily_restart_enabled"])
        restart_check = tk.Checkbutton(restart_frame, text="启用每日定时重启", 
                                      variable=self.restart_enabled,
                                      font=("Arial", 10),
                                      command=self.on_config_change)
        restart_check.pack(anchor="w", pady=(0, 10))
        
        # 重启时间设置
        time_frame = tk.Frame(restart_frame)
        time_frame.pack(fill="x", pady=(0, 10))
        
        tk.Label(time_frame, text="重启时间:", font=("Arial", 10)).pack(side="left")
        
        self.restart_time_var = tk.StringVar(value=self.config["restart_time"])
        time_entry = tk.Entry(time_frame, textvariable=self.restart_time_var, 
                             font=("Arial", 10), width=10)
        time_entry.pack(side="left", padx=(10, 5))
        time_entry.bind('<KeyRelease>', self.on_config_change)
        
        tk.Label(time_frame, text="(格式: HH:MM，如 08:00)", 
                font=("Arial", 9), fg="gray").pack(side="left", padx=(5, 0))
        
        # 警告延迟设置
        delay_frame = tk.Frame(restart_frame)
        delay_frame.pack(fill="x", pady=(0, 10))
        
        tk.Label(delay_frame, text="重启前警告时间:", font=("Arial", 10)).pack(side="left")
        
        self.delay_var = tk.IntVar(value=self.config["shutdown_delay"])
        delay_spin = tk.Spinbox(delay_frame, from_=10, to=300, 
                               textvariable=self.delay_var, 
                               font=("Arial", 10), width=10,
                               command=self.on_config_change)
        delay_spin.pack(side="left", padx=(10, 5))
        
        tk.Label(delay_frame, text="秒", font=("Arial", 10)).pack(side="left", padx=(5, 0))
        
        # 显示警告
        self.show_warning_var = tk.BooleanVar(value=self.config["show_warning"])
        warning_check = tk.Checkbutton(restart_frame, text="重启前显示警告对话框", 
                                      variable=self.show_warning_var,
                                      font=("Arial", 10),
                                      command=self.on_config_change)
        warning_check.pack(anchor="w")
        
        # 立即操作区域
        immediate_frame = tk.LabelFrame(main_frame, text="⚡ 立即执行", 
                                       font=("Arial", 12, "bold"), padx=10, pady=10)
        immediate_frame.pack(fill="x", pady=(0, 20))
        
        # 按钮行1
        btn_frame1 = tk.Frame(immediate_frame)
        btn_frame1.pack(fill="x", pady=(0, 10))
        
        tk.Button(btn_frame1, text="🔄 立即重启", font=("Arial", 10), 
                 bg="#FF9800", fg="white", width=12,
                 command=lambda: self.immediate_action("restart")).pack(side="left", padx=(0, 10))
        
        tk.Button(btn_frame1, text="🔌 立即关机", font=("Arial", 10), 
                 bg="#F44336", fg="white", width=12,
                 command=lambda: self.immediate_action("shutdown")).pack(side="left", padx=(0, 10))
        
        # 按钮行2
        btn_frame2 = tk.Frame(immediate_frame)
        btn_frame2.pack(fill="x")
        
        tk.Button(btn_frame2, text="👤 注销用户", font=("Arial", 10), 
                 bg="#9C27B0", fg="white", width=12,
                 command=lambda: self.immediate_action("logoff")).pack(side="left", padx=(0, 10))
        
        tk.Button(btn_frame2, text="😴 休眠", font=("Arial", 10), 
                 bg="#607D8B", fg="white", width=12,
                 command=lambda: self.immediate_action("hibernate")).pack(side="left", padx=(0, 10))
        
        # 状态显示区域
        status_frame = tk.LabelFrame(main_frame, text="📊 状态信息", 
                                    font=("Arial", 12, "bold"), padx=10, pady=10)
        status_frame.pack(fill="both", expand=True, pady=(0, 20))
        
        # 当前时间
        self.current_time_label = tk.Label(status_frame, text="", 
                                          font=("Arial", 11), fg="#2196F3")
        self.current_time_label.pack(anchor="w", pady=(0, 5))
        
        # 下次重启时间
        self.next_restart_label = tk.Label(status_frame, text="", 
                                          font=("Arial", 11), fg="#4CAF50")
        self.next_restart_label.pack(anchor="w", pady=(0, 5))
        
        # 状态
        self.status_label = tk.Label(status_frame, text="", 
                                    font=("Arial", 11), fg="#FF9800")
        self.status_label.pack(anchor="w", pady=(0, 10))
        
        # 日志显示
        log_label = tk.Label(status_frame, text="📝 操作日志:", font=("Arial", 10, "bold"))
        log_label.pack(anchor="w", pady=(10, 5))
        
        log_frame = tk.Frame(status_frame)
        log_frame.pack(fill="both", expand=True)
        
        self.log_text = tk.Text(log_frame, height=8, font=("Consolas", 9))
        log_scrollbar = tk.Scrollbar(log_frame, orient="vertical", command=self.log_text.yview)
        self.log_text.configure(yscrollcommand=log_scrollbar.set)
        
        self.log_text.pack(side="left", fill="both", expand=True)
        log_scrollbar.pack(side="right", fill="y")
        
        # 底部按钮
        bottom_frame = tk.Frame(main_frame)
        bottom_frame.pack(fill="x", pady=(10, 0))
        
        tk.Button(bottom_frame, text="💾 保存配置", font=("Arial", 10), 
                 bg="#4CAF50", fg="white", width=12,
                 command=self.save_config).pack(side="left", padx=(0, 10))
        
        tk.Button(bottom_frame, text="🔄 重载配置", font=("Arial", 10), 
                 bg="#2196F3", fg="white", width=12,
                 command=self.load_config).pack(side="left", padx=(0, 10))
        
        tk.Button(bottom_frame, text="❌ 退出程序", font=("Arial", 10), 
                 bg="#F44336", fg="white", width=12,
                 command=self.on_closing).pack(side="right")
        
        # 更新状态显示
        self.update_status()
        
        # 绑定关闭事件
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)

    def load_config(self):
        """加载配置文件"""
        try:
            if self.config_file.exists():
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    loaded_config = json.load(f)
                    self.config.update(loaded_config)
                # 只有在log_text存在时才记录日志
                if hasattr(self, 'log_text'):
                    self.log_message("✅ 配置文件加载成功")
            else:
                if hasattr(self, 'log_text'):
                    self.log_message("⚠️ 配置文件不存在，使用默认配置")
        except Exception as e:
            if hasattr(self, 'log_text'):
                self.log_message(f"❌ 加载配置失败: {e}")

    def save_config(self):
        """保存配置文件"""
        try:
            # 更新配置
            self.config["daily_restart_enabled"] = self.restart_enabled.get()
            self.config["restart_time"] = self.restart_time_var.get()
            self.config["shutdown_delay"] = self.delay_var.get()
            self.config["show_warning"] = self.show_warning_var.get()

            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(self.config, f, indent=2, ensure_ascii=False)

            self.log_message("✅ 配置保存成功")
            messagebox.showinfo("成功", "配置已保存！")
        except Exception as e:
            self.log_message(f"❌ 保存配置失败: {e}")
            messagebox.showerror("错误", f"保存配置失败: {e}")

    def on_config_change(self, event=None):
        """配置变更时的回调"""
        # 实时更新配置
        self.config["daily_restart_enabled"] = self.restart_enabled.get()
        self.config["restart_time"] = self.restart_time_var.get()
        self.config["shutdown_delay"] = self.delay_var.get()
        self.config["show_warning"] = self.show_warning_var.get()

        # 更新状态显示
        self.update_status()

    def log_message(self, message):
        """添加日志消息"""
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] {message}\n"

        self.log_text.insert(tk.END, log_entry)
        self.log_text.see(tk.END)

        # 限制日志行数
        lines = self.log_text.get("1.0", tk.END).split('\n')
        if len(lines) > 100:
            self.log_text.delete("1.0", "10.0")

    def update_status(self):
        """更新状态显示"""
        # 当前时间
        current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.current_time_label.config(text=f"🕐 当前时间: {current_time}")

        # 下次重启时间
        if self.config["daily_restart_enabled"]:
            try:
                restart_time = self.config["restart_time"]
                next_restart = self.get_next_restart_time(restart_time)
                self.next_restart_label.config(
                    text=f"🔄 下次重启: {next_restart.strftime('%Y-%m-%d %H:%M:%S')}"
                )
            except:
                self.next_restart_label.config(text="🔄 下次重启: 时间格式错误")
        else:
            self.next_restart_label.config(text="🔄 下次重启: 已禁用")

        # 运行状态
        if self.is_running:
            self.status_label.config(text="🟢 定时器运行中", fg="#4CAF50")
        else:
            self.status_label.config(text="🔴 定时器已停止", fg="#F44336")

        # 每秒更新一次
        self.root.after(1000, self.update_status)

    def get_next_restart_time(self, time_str):
        """获取下次重启时间"""
        try:
            hour, minute = map(int, time_str.split(':'))
            now = datetime.datetime.now()

            # 今天的重启时间
            today_restart = now.replace(hour=hour, minute=minute, second=0, microsecond=0)

            # 如果今天的时间已过，则设为明天
            if now >= today_restart:
                today_restart += datetime.timedelta(days=1)

            return today_restart
        except:
            raise ValueError("时间格式错误")

    def start_timer(self):
        """启动定时器线程"""
        if not self.is_running:
            self.is_running = True
            self.timer_thread = threading.Thread(target=self.timer_worker, daemon=True)
            self.timer_thread.start()
            self.log_message("🚀 定时器已启动")

    def stop_timer(self):
        """停止定时器"""
        self.is_running = False
        self.log_message("⏹️ 定时器已停止")

    def timer_worker(self):
        """定时器工作线程"""
        while self.is_running:
            try:
                if self.config["daily_restart_enabled"]:
                    restart_time = self.config["restart_time"]
                    next_restart = self.get_next_restart_time(restart_time)
                    now = datetime.datetime.now()

                    # 检查是否到了重启时间（误差在1分钟内）
                    time_diff = (next_restart - now).total_seconds()

                    if 0 <= time_diff <= 60:
                        self.log_message(f"⏰ 到达预定重启时间: {restart_time}")
                        self.execute_restart()

                        # 等待到下一天，避免重复执行
                        time.sleep(3600)  # 等待1小时

                time.sleep(30)  # 每30秒检查一次

            except Exception as e:
                self.log_message(f"❌ 定时器错误: {e}")
                time.sleep(60)  # 出错时等待1分钟再继续

    def execute_restart(self):
        """执行重启操作"""
        try:
            if self.config["show_warning"]:
                # 显示警告对话框
                delay = self.config["shutdown_delay"]
                result = messagebox.askyesno(
                    "⚠️ 定时重启警告",
                    f"系统将在 {delay} 秒后自动重启！\n\n"
                    f"点击 '是' 立即重启\n"
                    f"点击 '否' 取消重启\n\n"
                    f"如果不操作，系统将在 {delay} 秒后自动重启。",
                    default='no'
                )

                if result:  # 用户选择立即重启
                    self.log_message("👤 用户选择立即重启")
                    self.perform_system_action("restart")
                    return
                elif result is False:  # 用户选择取消
                    self.log_message("👤 用户取消了重启操作")
                    return

            # 延迟重启
            delay = self.config["shutdown_delay"]
            self.log_message(f"⏳ {delay}秒后执行重启...")

            # 在新线程中执行延迟重启
            threading.Thread(target=self.delayed_restart, args=(delay,), daemon=True).start()

        except Exception as e:
            self.log_message(f"❌ 执行重启失败: {e}")

    def delayed_restart(self, delay):
        """延迟重启"""
        try:
            time.sleep(delay)
            self.perform_system_action("restart")
        except Exception as e:
            self.log_message(f"❌ 延迟重启失败: {e}")

    def immediate_action(self, action):
        """立即执行操作"""
        action_names = {
            "restart": "重启",
            "shutdown": "关机",
            "logoff": "注销",
            "hibernate": "休眠"
        }

        action_name = action_names.get(action, action)

        result = messagebox.askyesno(
            f"⚠️ 确认{action_name}",
            f"确定要立即{action_name}吗？\n\n请确保已保存所有重要工作！"
        )

        if result:
            self.log_message(f"👤 用户选择立即{action_name}")
            self.perform_system_action(action)
        else:
            self.log_message(f"👤 用户取消了{action_name}操作")

    def perform_system_action(self, action):
        """执行系统操作"""
        try:
            commands = {
                "restart": ["shutdown", "/r", "/t", "0", "/f"],
                "shutdown": ["shutdown", "/s", "/t", "0", "/f"],
                "logoff": ["shutdown", "/l"],
                "hibernate": ["shutdown", "/h"]
            }

            if action not in commands:
                raise ValueError(f"不支持的操作: {action}")

            command = commands[action]
            self.log_message(f"🔧 执行命令: {' '.join(command)}")

            # 执行系统命令
            result = subprocess.run(command, capture_output=True, text=True)

            if result.returncode == 0:
                self.log_message(f"✅ {action} 命令执行成功")
            else:
                self.log_message(f"❌ {action} 命令执行失败: {result.stderr}")

        except Exception as e:
            self.log_message(f"❌ 执行系统操作失败: {e}")
            messagebox.showerror("错误", f"执行操作失败: {e}")

    def on_closing(self):
        """程序关闭时的处理"""
        if messagebox.askokcancel("退出", "确定要退出定时开关机软件吗？"):
            self.stop_timer()
            self.save_config()
            self.root.destroy()

    def run(self):
        """运行应用程序"""
        # 添加启动日志
        self.log_message("🚀 定时开关机软件启动")
        self.log_message(f"📅 每日重启: {'启用' if self.config['daily_restart_enabled'] else '禁用'}")
        if self.config['daily_restart_enabled']:
            self.log_message(f"⏰ 重启时间: {self.config['restart_time']}")

        # 启动主循环
        self.root.mainloop()

def main():
    """主函数"""
    try:
        # 检查是否为Windows系统
        if sys.platform != "win32":
            print("❌ 此软件仅支持Windows系统")
            return

        # 创建并运行应用
        app = TimerShutdownApp()
        app.run()

    except Exception as e:
        print(f"❌ 程序启动失败: {e}")
        messagebox.showerror("启动错误", f"程序启动失败: {e}")

if __name__ == "__main__":
    main()
